import { singleton } from "tsyringe";
import * as browser from "webextension-polyfill";

@singleton()
export class BrowserRuntimeService {

    public getHomePageUrl(): string {
        return browser.runtime.getManifest().homepage_url || "";
    }

    public openOptionsPage(): Promise<void> {
        return browser.runtime.openOptionsPage();
    }

}
