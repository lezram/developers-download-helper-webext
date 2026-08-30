import { inject, singleton } from "tsyringe";
import { FileWrapper } from "../../model/FileWrapper";
import { DownloaderRegistry } from "../downloader/DownloaderRegistry";
import { BrowserNotificationService } from "../browser/BrowserNotificationService";
import { BrowserDownloadService } from "../browser/BrowserDownloadService";
import { ContextOnClickAction } from "../../model/ContextMenuItem";
import { Action } from "../../model/Action";
import { ResourceNotAccessibleException } from "../../exception/ResourceNotAccessibleException";
import { Menus, Tabs } from "webextension-polyfill";
import OnClickData = Menus.OnClickData;

@singleton()
export class ContextMenuActionService {

    constructor(@inject(DownloaderRegistry) private downloaderRegistry: DownloaderRegistry,
        @inject(BrowserNotificationService) private browserNotificationService: BrowserNotificationService,
        @inject(BrowserDownloadService) private browserDownloadService: BrowserDownloadService) {
    }

    public getMenuItemAction(action: Action, downloaderId: string): ContextOnClickAction {
        return async (info: OnClickData, tab: Tabs.Tab) => {
            let notificationId = await this.browserNotificationService.showProgressNotification("Download", "Start processing...");

            let file: FileWrapper;
            try {
                const downloaderService = this.downloaderRegistry.getDownloader(downloaderId);
                const url = new URL(info.linkUrl);
                file = await downloaderService.getFile({
                    action: action,
                    url: url
                });
                notificationId = await this.browserNotificationService.updateProgressNotification(notificationId, "Download", "Files ready!");
            } catch (error) {
                if (error instanceof ResourceNotAccessibleException) {
                    await this.browserNotificationService.showErrorNotification("Not able to download resource", "Please check the extension options and permissions " + info.linkUrl);
                } else {
                    await this.browserNotificationService.showErrorNotification("Download not supported", "" + info.linkUrl);
                }

                return;
            }

            let askBeforeSave = false;

            if (action === Action.SAVE_AS) {
                askBeforeSave = true;
            }

            try {
                await this.browserDownloadService.downloadFile(file, askBeforeSave);
                await this.browserNotificationService.updateProgressNotification(notificationId, "Download", "Run!");
            } catch (error) {
                await this.browserNotificationService.showErrorNotification("Download failed", "" + error?.message);
            }
        };
    }

}
