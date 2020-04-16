import {inject, singleton} from "tsyringe";
import {DownloaderConfiguration,} from "../../model/Configuration";
import {ChromeContextMenuService} from "../chrome/ChromeContextMenuService";
import {ContextMenuActionService} from "./ContextMenuActionService";
import {ContextMenuItem, ContextOnClickAction} from "../../model/ContextMenuItem";
import {DownloaderRegistry} from "../downloader/DownloaderRegistry";
import {ConfigurationService} from "../ConfigurationService";
import {ActionItemMetadata} from "../../model/ActionItemMetadata";
import {DownloaderMetadata} from "../../model/DownloaderMetadata";
import {Util} from "../../util/Util";

@singleton()
export class ContextMenuService {

    constructor(@inject(ContextMenuActionService) private contextMenuActionService: ContextMenuActionService,
                @inject(ChromeContextMenuService) private chromeContextMenuService: ChromeContextMenuService,
                @inject(DownloaderRegistry) private downloaderRegistry: DownloaderRegistry,
                @inject(ConfigurationService) private configurationService: ConfigurationService
    ) {
    }

    public async createContextMenus(): Promise<void> {
        await this.addAllActionContextMenuItems();
    }

    public async updateContextMenus(): Promise<void> {
        await this.chromeContextMenuService.clearAllContextMenus();

        await this.addAllActionContextMenuItems();
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

                    const clickAction: ContextOnClickAction = this.contextMenuActionService.getMenuItemAction(item.id, downloader.id);

                    contextMenuItems.push({
                        action: item.id,
                        title: item.title,
                        urlPatterns: linkPatterns,
                        onclick: clickAction
                    });
                }

            }
        }

        return contextMenuItems;
    }

    private addItemsToContextMenu(contextMenuItems: ContextMenuItem[]): void {
        for (const item of contextMenuItems) {
            this.chromeContextMenuService.addContextMenu(item);
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