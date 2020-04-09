import {inject, singleton} from "tsyringe";
import {FileWrapper} from "../../model/FileWrapper";
import {Util} from "../../util/Util";
import {DownloaderRegistry} from "../downloader/DownloaderRegistry";
import {ChromeNotificationService} from "../chrome/ChromeNotificationService";
import {ChromeDownloadService} from "../chrome/ChromeDownloadService";
import {ContextOnClickAction} from "../../model/ContextMenuItem";
import OnClickData = chrome.contextMenus.OnClickData;
import {Action} from "../../model/Action";

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
                file = await downloaderService.getFile({url: url});
                this.chromeNotificationService.updateProgressNotification(notificationId, 60, "Download", "Files ready!");
            } catch (error) {
                console.log(error);
                this.chromeNotificationService.showErrorNotification("Download not supported", "" + info.linkUrl);
                return;
            }

            let askBeforeSave = false;

            if (action === Action.SAVE_AS) {
                askBeforeSave = true;
            }

            try {
                await this.chromeDownloadService.downloadFile(file, askBeforeSave);
                this.chromeNotificationService.updateProgressNotification(notificationId, 100, "Download", "Run!");
                this.clearNotification();
            } catch (error) {
                console.log(error);
                this.chromeNotificationService.showErrorNotification("Download failed", "" + error?.message);
            }
        };
    }

    private async clearNotification(): Promise<void> {
        await Util.sleep(2000);
        this.chromeNotificationService.clearNotifications();
    }

}