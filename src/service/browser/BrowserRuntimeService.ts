import {singleton} from "tsyringe";
import {browser} from "webextension-polyfill-ts";

@singleton()
export class BrowserRuntimeService {

    public getHomePageUrl(): string {
        return browser.runtime.getManifest().homepage_url || "";
    }

}
