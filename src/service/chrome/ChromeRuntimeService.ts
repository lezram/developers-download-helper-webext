import {singleton} from "tsyringe";

@singleton()
export class ChromeRuntimeService {

    public getHomePageUrl(): string {
        return chrome.runtime.getManifest().homepage_url || "";
    }

}