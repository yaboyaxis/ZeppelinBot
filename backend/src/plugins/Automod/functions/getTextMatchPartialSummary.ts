import { MatchableTextType } from "./matchMultipleTextTypesOnMessage";
import { AutomodContext, AutomodPluginType } from "../types";
import { messageSummary, verboseChannelMention } from "../../../utils";
import { GuildPluginData } from "knub";

export function getTextMatchPartialSummary(
  pluginData: GuildPluginData<AutomodPluginType>,
  type: MatchableTextType,
  context: AutomodContext,
) {
  switch (type) {
    case "message": {
      const message = context.message!;
      const channel = pluginData.guild.channels.get(message.channel_id);
      const channelMention = channel ? verboseChannelMention(channel) : `\`#${message.channel_id}\``;

      return `message in ${channelMention}:\n${messageSummary(message)}`;
    }
    case "embed": {
      const message = context.message!;
      const channel = pluginData.guild.channels.get(message.channel_id);
      const channelMention = channel ? verboseChannelMention(channel) : `\`#${message.channel_id}\``;

      return `message embed in ${channelMention}:\n${messageSummary(message)}`;
    }
    case "username": {
      return `username: ${context.user!.username}`;
    }
    case "nickname": {
      return `nickname: ${context.member!.nick}`;
    }
    case "visiblename": {
      const visibleName = context.member?.nick || context.user!.username;
      return `visible name: ${visibleName}`;
    }
    case "customstatus": {
      return `custom status: ${context.member!.game!.state}`;
    }
  }
}
