import OnClickData = chrome.contextMenus.OnClickData;
import {Action} from "./Action";

export type ContextOnClickAction = (info: OnClickData, tab: chrome.tabs.Tab) => Promise<void>;

export class ContextMenuItem {
    action: Action;
    title: string;
    urlPatterns: string[];
    onclick: ContextOnClickAction;
}