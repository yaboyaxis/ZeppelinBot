import { RecentActionType, SpamPluginType } from "../types";
import { GuildPluginData } from "knub";

export function getRecentActions(
  pluginData: GuildPluginData<SpamPluginType>,
  type: RecentActionType,
  userId: string,
  actionGroupId: string,
  since: number,
) {
  return pluginData.state.recentActions.filter(action => {
    switch (true) {
      case action.timestamp < since:
      case action.type !== type:
      case action.actionGroupId !== actionGroupId:
      case action.userId !== userId: {
        return false;
      }
    }
    return true;
  });
}
