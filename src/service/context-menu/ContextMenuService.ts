import {inject, singleton} from "tsyringe";
import {DownloaderConfiguration,} from "../../model/Configuration";
import {ContextMenuActionService} from "./ContextMenuActionService";
import {ContextMenuItem, ContextMenuItemId} from "../../model/ContextMenuItem";
import {Menus, Tabs} from "webextension-polyfill";
import {DownloaderRegistry} from "../downloader/DownloaderRegistry";
import {ConfigurationService} from "../ConfigurationService";
import {ActionItemMetadata} from "../../model/ActionItemMetadata";
import {DownloaderMetadata} from "../../model/DownloaderMetadata";
import {Util} from "../../util/Util";
import {BrowserContextMenuService} from "../browser/BrowserContextMenuService";

@singleton()
export class ContextMenuService {

    constructor(@inject(ContextMenuActionService) private contextMenuActionService: ContextMenuActionService,
                @inject(BrowserContextMenuService) private browserContextMenuService: BrowserContextMenuService,
                @inject(DownloaderRegistry) private downloaderRegistry: DownloaderRegistry,
                @inject(ConfigurationService) private configurationService: ConfigurationService
    ) {
    }

    public registerContextMenuClickListener(): void {
        this.browserContextMenuService.addOnClickListener(async (info: Menus.OnClickData, tab: Tabs.Tab): Promise<void> => {
            await this.handleContextMenuClick(info, tab);
        });
    }

    public async createContextMenus(): Promise<void> {
        await this.browserContextMenuService.clearAllContextMenus();

        await this.addAllActionContextMenuItems();
    }

    public async updateContextMenus(): Promise<void> {
        await this.createContextMenus();
    }

    private async handleContextMenuClick(info: Menus.OnClickData, tab: Tabs.Tab): Promise<void> {
        const menuItem = ContextMenuItemId.parse("" + info.menuItemId);

        if (!menuItem) {
            return;
        }

        const clickAction = this.contextMenuActionService.getMenuItemAction(menuItem.action, menuItem.downloaderId);

        await clickAction(info, tab);
    }

    private async addAllActionContextMenuItems(): Promise<void> {
        const activeActionItems: ActionItemMetadata[] = await this.configurationService.getActiveActionItems();
        const downloaders: DownloaderMetadata[] = this.downloaderRegistry.getAllDownloadersMetadata();

        const contextMenuItems: ContextMenuItem[] = await this.createContextMenuItems(activeActionItems, downloaders);

        this.addItemsToContextMenu(contextMenuItems);
    }

    private async createContextMenuItems(activeItems: ActionItemMetadata[], downloaders: DownloaderMetadata[]): Promise<ContextMenuItem[]> {
        const contextMenuItems: ContextMenuItem[] = [];
        for (const item of activeItems) {
            for (const downloader of downloaders) {
                let downloaderConfiguration = await this.configurationService.getDownloaderCustomConfiguration(downloader.id);

                if (this.isDownloaderEnabled(downloader, downloaderConfiguration)) {
                    let linkPatterns = this.getLinkPatterns(downloader, downloaderConfiguration);

                    contextMenuItems.push({
                        id: ContextMenuItemId.create(item.id, downloader.id),
                        action: item.id,
                        title: item.title,
                        urlPatterns: linkPatterns
                    });
                }

            }
        }

        return contextMenuItems;
    }

    private addItemsToContextMenu(contextMenuItems: ContextMenuItem[]): void {
        for (const item of contextMenuItems) {
            this.browserContextMenuService.addContextMenu(item);
        }
    }

    private getLinkPatterns(downloader: DownloaderMetadata, downloaderConfiguration: DownloaderConfiguration): string[] {
        const patterns = [];

        if (downloader &&
            downloader.configuration &&
            Array.isArray(downloader.configuration.linkPatterns) &&
            downloader.configuration.linkPatterns.length > 0
        ) {
            patterns.push(...downloader.configuration.linkPatterns);
        }

        if (downloaderConfiguration &&
            Array.isArray(downloaderConfiguration.linkPatterns) &&
            downloaderConfiguration.linkPatterns.length > 0) {
            patterns.push(...downloaderConfiguration.linkPatterns);
        }

        return patterns;
    }

    private isDownloaderEnabled(downloader: DownloaderMetadata, downloaderConfiguration: DownloaderConfiguration) {
        if (downloaderConfiguration &&
            downloaderConfiguration.disabled === true ||
            ((!downloaderConfiguration || Util.isNull(downloaderConfiguration.disabled)) &&
                downloader &&
                downloader.configuration &&
                downloader.configuration.disabled === true)
        ) {
            return false;
        }

        if (downloader &&
            downloader.configuration &&
            Array.isArray(downloader.configuration.linkPatterns) &&
            downloader.configuration.linkPatterns.length > 0
        ) {
            return true;
        }

        return downloaderConfiguration &&
            Array.isArray(downloaderConfiguration.linkPatterns) &&
            downloaderConfiguration.linkPatterns.length > 0;
    }
}
