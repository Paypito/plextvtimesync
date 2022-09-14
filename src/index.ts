import dayjs, { Dayjs } from 'dayjs';
import * as config from "../config.json";
import PlexApi from "./plex/api";
import PlexHistory from "./plex/models/history";
import Episode from "./tvtime/models/episode";
import JsonStorage from './storage';
import TvTimeApi from "./tvtime/api";

let plexHistory: PlexHistory[];
let lastCheck: Dayjs;
let storage = new JsonStorage();

(async () => {
  print("Démarrage du bot ...");
  lastCheck = dayjs();
  start();
  setInterval(() => {
    start();
  }, config.timer * 1000 * 60);
})();

async function start() {
  plexHistory = await getPlexHistory();
  print(`Il y a ${plexHistory.length} épisodes a synchroniser`);
  for (const item of plexHistory) {
    print(`${item.showTitle} - S${item.seasonNumber}E${item.episodeNumber} - ${item.episodeTitle}`);
    await findShow(item);
  }
  print(`Prochaine vérification dans ${config.timer} minutes.`);
  lastCheck = dayjs();
}

async function findShow(history: PlexHistory) {
  print(`Recherche de la correspondance sur TVTime...`);
  if (await storage.hasLink(history.id)) {
    let show = await TvTimeApi.getShow(await storage.getLink(history.id));
    let episode = show?.seasons[Number(history.seasonNumber) - 1].episodes[Number(history.episodeNumber) - 1];
    if (episode) {
      await TvTimeApi.markAsWatched(episode.id) ? print(`${episode.name}: marqué comme vu.`) : print(`${episode.name}: une erreur est survenue`);
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
        await TvTimeApi.markAsWatched(episode.id) ? print(`${episode.name}: marqué comme vu.`) : print(`${episode.name}: une erreur est survenue`);
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