import {singleton} from "tsyringe";
import {ContextMenuItem} from "../../model/ContextMenuItem";

@singleton()
export class ChromeContextMenuService {

    public addContextMenu(contextMenuItem: ContextMenuItem) {
        chrome.contextMenus.create({
            type: "normal",
            title: contextMenuItem.title,
            targetUrlPatterns: contextMenuItem.urlPatterns,
            documentUrlPatterns: ["<all_urls>"],
            contexts: ["link"],
            onclick: contextMenuItem.onclick
        });
    }

    public clearAllContextMenus(): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.contextMenus.removeAll(() => {
                resolve();
            });
        });

    }
}