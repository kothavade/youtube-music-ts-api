import * as http from "http";
import * as https from "https";
import { IIncomingMessage } from "../interfaces-internal";
import AlbumParser from "../parsers/album-parser";
import ArtistParser from "../parsers/artist-parser";
import PlaylistParser from "../parsers/playlist-parser";
import TrackParser from "../parsers/track-parser";
import YouTubeMusicContext from "../context";

export default class YouTubeMusicBase {
  hostname: string = "music.youtube.com";
  basePath: string = "/youtubei/v1/";
  queryString: string = "?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";
  origin: string = "https://music.youtube.com";
  albumParser: AlbumParser;
  artistParser: ArtistParser;
  playlistParser: PlaylistParser;
  trackParser: TrackParser;

  constructor() {
    this.albumParser = new AlbumParser();
    this.artistParser = new ArtistParser();
    this.playlistParser = new PlaylistParser();
    this.trackParser = new TrackParser();
  }

  protected generateHeaders() {
    return {
      "X-Origin": this.origin,
    };
  }

  protected async sendRequest(
    path: string,
    data?: any,
    additionalQueryString?: string,
  ): Promise<any> {
    let dataStr: string = undefined;
    if (data) {
      data = {
        ...YouTubeMusicContext,
        ...data,
      };
      dataStr = JSON.stringify(data);
    }
    const queryString = additionalQueryString
      ? `${this.queryString}&${additionalQueryString}`
      : this.queryString;
    // const response = await this.sendHttpsRequest(
    //   {
    //     hostname: this.hostname,
    //     path: `${this.basePath}${path}${queryString}`,
    //     method: "POST",
    //     headers: this.generateHeaders(),
    //   },
    //   dataStr,
    // );
    // if (response.statusCode === 200 && response.body) {
    //   const body = JSON.parse(response.body);
    //   if (body) {
    //     return body;
    //   }
    // }
    // use fetch instead of https.request
    const url = `https://${this.hostname}${this.basePath}${path}${queryString}`;
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: this.generateHeaders(),
      body: dataStr,
    };
    const response = await fetch(url, fetchOptions);
    if (response.status === 200) {
      const body = await response.json();
      if (body) {
        return body;
      }
    }
    // throw new Error(
    //   `Request failed with status code ${response.status} and body ${response.body}`,
    // );
    // body is readable stream, so we need to read it
    const body = await response.text();
    throw new Error(
      `Request failed with status code ${response.status} and body ${body}`,
    );
  }

  protected playlistIdTrim(playlistId: string): string {
    if (playlistId && playlistId.toUpperCase().startsWith("VL")) {
      return playlistId.substring(2);
    }
    return playlistId;
  }

  protected playlistIdPad(playlistId: string): string {
    if (playlistId && !playlistId.toUpperCase().startsWith("VL")) {
      return "VL" + playlistId;
    }
    return playlistId;
  }
}
