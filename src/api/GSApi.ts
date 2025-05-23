import dotenv from "dotenv";
import { SiteInfos} from "../models/site-infos";
import { GSApiResponse } from "../models/gs-api-models";

dotenv.config();

export class GSApi {
  private siteInfo: SiteInfos;
  private apiKey: string = process.env.API_KEY || "";
  private extensionVersion: string = process.env.EXTENSION_VERSION || "";

  constructor(siteInfo: SiteInfos) {
    this.siteInfo = siteInfo;
  }

  async chatCompletion(): Promise<GSApiResponse> {
    const body = {
      siteInfos: {
        ...this.siteInfo,
        extensionVersion: this.extensionVersion,
      },
    };
    console.log("body", JSON.stringify(body, null, 2));
    const response = await fetch(process.env.API_URL + "/chatcompletion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json() as GSApiResponse;
  }
}
