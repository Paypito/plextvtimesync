import fs from "fs";

export default class JsonStorage {

  async addLink(idShowPlex: number, idShowTvTime: number) {
    let link = await this.getLinks();
    link[idShowPlex] = idShowTvTime;
    await fs.promises.writeFile('./link.json', JSON.stringify(link));
  }

  async getLinks() {
    try {
      let link = await fs.promises.readFile('./link.json');
      return JSON.parse(link.toString());
    } catch (err) {
      return {};
    }
  }

  async hasLink(idShowPlex: number) {
    let link = await this.getLinks();
    return link.hasOwnProperty(idShowPlex);
  }

  async getLink(idShowPlex: number) {
    let link = await this.getLinks();
    return link[idShowPlex];
  }

}