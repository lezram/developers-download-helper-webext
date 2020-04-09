import {singleton} from "tsyringe";
import {ContextMenuItem} from "../../model/ContextMenuItem";

@singleton()
export class ChromeContextMenuService {

    public addContextMenu(contextMenuItem: ContextMenuItem) {
        chrome.contextMenus.create({
            type: "normal",
            title: contextMenuItem.title,
            targetUrlPatterns: contextMenuItem.urlPatterns,
            documentUrlPatterns: contextMenuItem.urlPatterns,
            contexts: ["link"],
            onclick: contextMenuItem.onclick
        });
    }

    public clearAllContextMenus(): void  {
        chrome.contextMenus.removeAll();
    }
}