import { RecentActionType, SpamPluginType } from "../types";
import { GuildPluginData } from "knub";

export function getRecentActionCount(
  pluginData: GuildPluginData<SpamPluginType>,
  type: RecentActionType,
  userId: string,
  actionGroupId: string,
  since: number,
): number {
  return pluginData.state.recentActions.reduce((count, action) => {
    switch (true) {
      case action.timestamp < since:
      case action.type !== type:
      case action.actionGroupId !== actionGroupId:
      case action.userId !== userId: {
        return count;
      }
    }
    return count + action.count;
  }, 0);
}
