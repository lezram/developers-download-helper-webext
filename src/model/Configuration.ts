import {Action} from "./Action";

export class Configuration {
    downloader: Map<string, DownloaderConfiguration> = new Map<string, DownloaderConfiguration>();
    contextMenu: Map<Action, ContextMenuItemConfiguration> = new Map<Action, ContextMenuItemConfiguration>();
}

export class DownloaderConfiguration {
    linkPatterns: string[];
    permissions: string[];
    disabled?: boolean;
}

export class ContextMenuItemConfiguration {
    active: boolean;
}