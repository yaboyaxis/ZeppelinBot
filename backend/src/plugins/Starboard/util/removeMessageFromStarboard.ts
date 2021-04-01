import { GuildPluginData } from "knub";
import { StarboardMessage } from "../../../data/entities/StarboardMessage";
import { noop } from "../../../utils";
import { StarboardPluginType } from "../types";

export async function removeMessageFromStarboard(pluginData: GuildPluginData<StarboardPluginType>, msg: StarboardMessage) {
  await pluginData.client.deleteMessage(msg.starboard_channel_id, msg.starboard_message_id).catch(noop);
}
