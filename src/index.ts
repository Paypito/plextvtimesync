import dayjs, { Dayjs } from 'dayjs';
import {config} from "./config";
import PlexApi from "./plex/api";
import PlexHistory from "./plex/models/history";
import Episode from "./tvtime/models/episode";
import JsonStorage from './storage';
import TvTimeApi from "./tvtime/api";

let plexHistory: PlexHistory[];
let lastCheck: Dayjs;
let storage = new JsonStorage();

(async () => {
  print("Starting the bot ...");
  lastCheck = dayjs();
  start();
  setInterval(() => {
    start();
  }, config.timer * 1000 * 60);
})();

async function start() {
  plexHistory = await getPlexHistory();
  print(`There are ${plexHistory.length} episodes to synchronize`);
  for (const item of plexHistory) {
    print(`${item.showTitle} - S${item.seasonNumber}E${item.episodeNumber} - ${item.episodeTitle}`);
    await findShow(item);
  }
  print(`Next check in ${config.timer} minutes.`);
  lastCheck = dayjs();
}

async function findShow(history: PlexHistory) {
  print(`Search for correspondence on TVTime...`);
  if (await storage.hasLink(history.id)) {
    let show = await TvTimeApi.getShow(await storage.getLink(history.id));
    let episode = show?.seasons[Number(history.seasonNumber) - 1].episodes[Number(history.episodeNumber) - 1];
    if (episode) {
      await TvTimeApi.markAsWatched(episode.id) ? print(`${episode.name}: marked as seen.`) : print(`${episode.name}: An error has occurred`);
    }
  } else {
    let searchs = await TvTimeApi.searchShow(history.showTitle);
    for (const search of searchs) {
      let show = await TvTimeApi.getShow(search.id);
      let episode: Episode;
      try {
        episode = show!.seasons[Number(history.seasonNumber) - 1].episodes[Number(history.episodeNumber) - 1];
      } catch (err) {
        break;
      }
      if (show != null && episode?.airDate == history.date) {
        print(`Correspondance: ${show.name}(${show.id}) - ${episode.name}(${episode.id}) `);
        await storage.addLink(history.id, show.id);
        await TvTimeApi.markAsWatched(episode.id) ? print(`${episode.name}: marked as seen.`) : print(`${episode.name}: An error has occurred`);
      }
    }
  }
}

async function getPlexHistory() {
  return await PlexApi.getLibaryHistory(config.plex.token, "viewedAt:desc", lastCheck.unix(), 1);
}

function print(message: string) {
  console.log("[" + dayjs(Date.now()).format("HH:mm:ss") + "]", message);
}