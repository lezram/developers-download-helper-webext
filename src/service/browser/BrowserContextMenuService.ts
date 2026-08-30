import { singleton } from "tsyringe";
import { ContextMenuItem, ContextOnClickAction } from "../../model/ContextMenuItem";
import * as browser from "webextension-polyfill";

@singleton()
export class BrowserContextMenuService {

    public addContextMenu(contextMenuItem: ContextMenuItem): void {
        browser.contextMenus.create({
            id: contextMenuItem.id,
            type: "normal",
            title: contextMenuItem.title,
            targetUrlPatterns: contextMenuItem.urlPatterns,
            documentUrlPatterns: ["<all_urls>"],
            contexts: ["link"]
        });
    }

    public clearAllContextMenus(): Promise<void> {
        return browser.contextMenus.removeAll();

    }

    public addOnClickListener(onClick: ContextOnClickAction): void {
        browser.contextMenus.onClicked.addListener(async (info, tab): Promise<void> => {
            await onClick(info, tab);
        });
    }
}
