import { Menus, Tabs } from "webextension-polyfill";
import { Action } from "./Action";

export type ContextOnClickAction = (info: Menus.OnClickData, tab: Tabs.Tab) => Promise<void>;

export class ContextMenuItem {
    id: string;
    action: Action;
    title: string;
    urlPatterns: string[];
}

export class ContextMenuItemId {
    private static readonly SEPARATOR = "|";

    public static create(action: Action, downloaderId: string): string {
        return action + ContextMenuItemId.SEPARATOR + downloaderId;
    }

    public static parse(menuItemId: string): { action: Action, downloaderId: string } {
        const separatorIndex = (menuItemId || "").indexOf(ContextMenuItemId.SEPARATOR);

        if (separatorIndex < 0) {
            return null;
        }

        const action = menuItemId.substring(0, separatorIndex);

        if (!Object.values(Action).includes(<Action>action)) {
            return null;
        }

        return {
            action: <Action>action,
            downloaderId: menuItemId.substring(separatorIndex + 1)
        };
    }
}
