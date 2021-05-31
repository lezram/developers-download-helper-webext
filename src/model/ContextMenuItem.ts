import {Menus, Tabs} from "webextension-polyfill-ts";
import {Action} from "./Action";

export type ContextOnClickAction = (info: Menus.OnClickData, tab: Tabs.Tab) => Promise<void>;

export class ContextMenuItem {
    action: Action;
    title: string;
    urlPatterns: string[];
    onclick: ContextOnClickAction;
}
