import { getRepository, Repository } from "typeorm";
import { ApiPermissionAssignment } from "./entities/ApiPermissionAssignment";
import { BaseRepository } from "./BaseRepository";
import { ApiPermissions } from "@shared/apiPermissions";

export enum ApiPermissionTypes {
  User = "USER",
  Role = "ROLE",
}

export class ApiPermissionAssignments extends BaseRepository {
  private apiPermissions: Repository<ApiPermissionAssignment>;

  constructor() {
    super();
    this.apiPermissions = getRepository(ApiPermissionAssignment);
  }

  getByGuildId(guildId: string) {
    return this.apiPermissions.find({
      where: {
        guild_id: guildId,
      },
    });
  }

  getByUserId(userId: string) {
    return this.apiPermissions.find({
      where: {
        type: ApiPermissionTypes.User,
        target_id: userId,
      },
    });
  }

  getByGuildAndUserId(guildId: string, userId: string) {
    return this.apiPermissions.findOne({
      where: {
        guild_id: guildId,
        type: ApiPermissionTypes.User,
        target_id: userId,
      },
    });
  }

  addUser(guildId: string, userId: string, permissions: ApiPermissions[]) {
    return this.apiPermissions.insert({
      guild_id: guildId,
      type: ApiPermissionTypes.User,
      target_id: userId,
      permissions,
    });
  }

  removeUser(guildId: string, userId: string) {
    return this.apiPermissions.delete({ guild_id: guildId, type: ApiPermissionTypes.User, target_id: userId });
  }
}
