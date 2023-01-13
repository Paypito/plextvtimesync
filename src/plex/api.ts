import {config} from "../config";
import axios from 'axios';
import PlexHistory from './models/history';

export default class PlexApi {
  /**
   * Get Plex libary history
   * @param {string} plexToken
   * @param {string} sort - viewedAt:desc
   * @param {string} viewedAt - Only required for files with password
   * @param {string} accountId - Timestamp
   * @returns {Promise<PlexHistory[]>}
   */
  static getLibaryHistory = async (plexToken: string, sort?: string, viewedAt?: number, accountId?: number): Promise<PlexHistory[]> => {
    try {
      let url = config.plex.baseUrl + `/status/sessions/history/all?X-Plex-Token=${plexToken}&sort=${sort}&viewedAt>=${viewedAt}&accountID=${accountId}`;
      let result = await axios.get(url);
      const history: PlexHistory[] = [];
      result.data.MediaContainer.Metadata.filter((item: any) => item?.type == "episode").map((item: any) =>
        history.push({
          id: item?.grandparentKey.slice(item?.grandparentKey.lastIndexOf("/") + 1),
          episodeTitle: item?.title,
          showTitle: item?.grandparentTitle,
          episodeNumber: item?.index,
          seasonNumber: item?.parentIndex,
          date: item?.originallyAvailableAt,
          viewedAt: item?.need_premium,
        }),
      );
      return history;
    } catch (err) {
      return [];
    }
  };
}