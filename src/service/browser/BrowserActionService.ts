import { singleton } from "tsyringe";
import * as browser from "webextension-polyfill";

@singleton()
export class BrowserActionService {

    public addOnClickListener(onClick: () => Promise<void>): void {
        browser.action.onClicked.addListener(async (): Promise<void> => {
            await onClick();
        });
    }
}
