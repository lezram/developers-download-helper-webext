import {inject, singleton} from "tsyringe";
import {FileWrapper} from "../../model/FileWrapper";
import {Util} from "../../util/Util";
import {DownloaderRegistry} from "../downloader/DownloaderRegistry";
import {ChromeNotificationService} from "../chrome/ChromeNotificationService";
import {ChromeDownloadService} from "../chrome/ChromeDownloadService";
import {ContextOnClickAction} from "../../model/ContextMenuItem";
import OnClickData = chrome.contextMenus.OnClickData;
import {Action} from "../../model/Action";
import {ResourceNotAccessibleException} from "../../exception/ResourceNotAccessibleException";

@singleton()
export class ContextMenuActionService {

    constructor(@inject(DownloaderRegistry) private downloaderRegistry: DownloaderRegistry,
                @inject(ChromeNotificationService) private chromeNotificationService: ChromeNotificationService,
                @inject(ChromeDownloadService) private chromeDownloadService: ChromeDownloadService) {
    }

    public getMenuItemAction(action: Action, downloaderId: string): ContextOnClickAction {
        const downloaderService = this.downloaderRegistry.getDownloader(downloaderId);

        return async (info: OnClickData, tab: chrome.tabs.Tab) => {
            const notificationId = this.chromeNotificationService.showProgressNotification(0, "Download", "Start processing...");

            let file: FileWrapper;
            try {
                const url = new URL(info.linkUrl);
                file = await downloaderService.getFile({
                    action: action,
                    url: url
                });
                this.chromeNotificationService.updateProgressNotification(notificationId, 60, "Download", "Files ready!");
            } catch (error) {
                await this.clearNotification();
                if (error instanceof ResourceNotAccessibleException) {
                    this.chromeNotificationService.showErrorNotification("Not able to download resource", "Please check the extension options and permissions " + info.linkUrl);
                } else {
                    this.chromeNotificationService.showErrorNotification("Download not supported", "" + info.linkUrl);
                }

                return;
            }

            let askBeforeSave = false;

            if (action === Action.SAVE_AS) {
                askBeforeSave = true;
            }

            try {
                await this.chromeDownloadService.downloadFile(file, askBeforeSave);
                this.chromeNotificationService.updateProgressNotification(notificationId, 100, "Download", "Run!");
                await this.clearNotification();
            } catch (error) {
                this.chromeNotificationService.showErrorNotification("Download failed", "" + error?.message);
            }
        };
    }

    private async clearNotification(): Promise<void> {
        await Util.sleep(2000);
        this.chromeNotificationService.clearNotifications();
    }

}