import {inject, singleton} from "tsyringe";
import {Configuration, ContextMenuItemConfiguration, DownloaderMetadata} from "../../model/Configuration";
import {ChromeContextMenuService} from "../chrome/ChromeContextMenuService";
import {ContextMenuActionService} from "./ContextMenuActionService";
import {ContextMenuItem, ContextOnClickAction} from "../../model/ContextMenuItem";

@singleton()
export class ContextMenuService {

    constructor(@inject(ContextMenuActionService) private contextMenuActionService: ContextMenuActionService,
                @inject(ChromeContextMenuService) private chromeContextMenuService: ChromeContextMenuService,
    ) {
    }

    public createContextMenus(configuration: Configuration): void {
        this.addAllActionContextMenuItems(configuration);
    }

    public updateContextMenus(configuration: Configuration): void {
        this.chromeContextMenuService.clearAllContextMenus();

        this.addAllActionContextMenuItems(configuration);
    }

    private addAllActionContextMenuItems(configuration: Configuration): void {
        const menuItems: ContextMenuItemConfiguration[] = this.getActiveContextMenuItems(configuration.contextMenu);
        const downloaders: DownloaderMetadata[] = this.getDownloaders(configuration.downloader);

        const contextMenuItems: ContextMenuItem[] = this.createContextMenuItems(menuItems, downloaders);

        this.addItemsToContextMenu(contextMenuItems);
    }

    private createContextMenuItems(menuItems: ContextMenuItemConfiguration[], downloaders: DownloaderMetadata[]): ContextMenuItem[] {
        const contextMenuItems: ContextMenuItem[] = [];
        for (const menuItem of menuItems) {
            for (const downloader of downloaders) {
                const clickAction: ContextOnClickAction = this.contextMenuActionService.getMenuItemAction(menuItem.id, downloader.id);

                contextMenuItems.push({
                    action: menuItem.id,
                    title: menuItem.title,
                    urlPatterns: downloader.urlPatterns,
                    onclick: clickAction
                });
            }
        }

        return contextMenuItems;
    }

    private addItemsToContextMenu(contextMenuItems: ContextMenuItem[]): void {
        for (const item of contextMenuItems) {
            this.chromeContextMenuService.addContextMenu(item);
        }
    }

    private getActiveContextMenuItems(contextMenuItems: ContextMenuItemConfiguration[]): ContextMenuItemConfiguration[] {
        return contextMenuItems.filter(menuItem => {
            return menuItem != null && menuItem.active;
        });
    }

    private getDownloaders(downloaders: DownloaderMetadata[]): DownloaderMetadata[] {
        return downloaders.filter(downloader => {
            return downloader != null && downloader.urlPatterns && downloader.urlPatterns.length > 0;
        });
    }
}