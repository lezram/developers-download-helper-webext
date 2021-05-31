import {singleton} from "tsyringe";
import {ContextMenuItem} from "../../model/ContextMenuItem";
import { browser } from "webextension-polyfill-ts";

@singleton()
export class BrowserContextMenuService {

    public addContextMenu(contextMenuItem: ContextMenuItem): void {
        browser.contextMenus.create({
            type: "normal",
            title: contextMenuItem.title,
            targetUrlPatterns: contextMenuItem.urlPatterns,
            documentUrlPatterns: ["<all_urls>"],
            contexts: ["link"],
            onclick: contextMenuItem.onclick
        });
    }

    public clearAllContextMenus(): Promise<void> {
        return browser.contextMenus.removeAll();

    }
}
