import { Config } from "./entities/Config";
import { getRepository, Repository } from "typeorm";
import { connection } from "./db";
import { BaseRepository } from "./BaseRepository";
import { isAPI } from "../globals";
import { HOURS, SECONDS } from "../utils";
import { cleanupConfigs } from "./cleanup/configs";

if (isAPI()) {
  const CLEANUP_INTERVAL = 1 * HOURS;

  async function cleanup() {
    await cleanupConfigs();
    setTimeout(cleanup, CLEANUP_INTERVAL);
  }

  // Start first cleanup 30 seconds after startup
  setTimeout(cleanup, 30 * SECONDS);
}

export class Configs extends BaseRepository {
  private configs: Repository<Config>;

  constructor() {
    super();
    this.configs = getRepository(Config);
  }

  getActiveByKey(key) {
    return this.configs.findOne({
      where: {
        key,
        is_active: true,
      },
    });
  }

  async getHighestId(): Promise<number> {
    const rows = await connection.query("SELECT MAX(id) AS highest_id FROM configs");
    return (rows.length && rows[0].highest_id) || 0;
  }

  getActiveLargerThanId(id: number) {
    return this.configs
      .createQueryBuilder()
      .where("id > :id", { id })
      .andWhere("is_active = 1")
      .getMany();
  }

  async hasConfig(key: string) {
    return (await this.getActiveByKey(key)) != null;
  }

  getRevisions(key: string, num = 10) {
    return this.configs.find({
      relations: this.getRelations(),
      where: { key },
      select: ["id", "key", "is_active", "edited_by", "edited_at"],
      order: {
        edited_at: "DESC",
      },
      take: num,
    });
  }

  async saveNewRevision(key: string, config, editedBy: string) {
    return connection.transaction(async entityManager => {
      const repo = entityManager.getRepository(Config);
      // Mark all old revisions inactive
      await repo.update({ key }, { is_active: false });
      // Add new, active revision
      await repo.insert({
        key,
        config,
        is_active: true,
        edited_by: editedBy,
      });
    });
  }
}
