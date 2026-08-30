import { singleton } from "tsyringe";
import * as browser from "webextension-polyfill";
import { Notifications } from "webextension-polyfill";

type ChromiumNotifications = Notifications.Static & {
    update?(notificationId: string, options: Notifications.CreateNotificationOptions): Promise<boolean>;
};

@singleton()
export class BrowserNotificationService {
    private static readonly CROSS_BROWSER_NOTIFICATION_TYPE = "basic";
    private static readonly ICON_PATH = "images/icon-48.png";
    private static readonly ERROR_ICON_PATH = "images/icon-red-48.png";

    private notifications: string[] = [];

    public async showErrorNotification(title: string, message: string): Promise<void> {
        await this.clearNotifications();

        await this.createNotification(BrowserNotificationService.ERROR_ICON_PATH, title, message);
    }

    public async showProgressNotification(title: string, message: string): Promise<string> {
        await this.clearNotifications();

        return this.createNotification(BrowserNotificationService.ICON_PATH, title, message);
    }

    public async updateProgressNotification(notificationId: string, title: string, message: string): Promise<string> {
        const isUpdated = await this.tryUpdateNotification(notificationId, title, message);

        if (isUpdated) {
            return notificationId;
        }

        await this.clearNotifications();

        return this.createNotification(BrowserNotificationService.ICON_PATH, title, message);
    }

    private async tryUpdateNotification(notificationId: string, title: string, message: string): Promise<boolean> {
        const notifications = browser.notifications as ChromiumNotifications;

        if (typeof notifications.update !== "function") {
            return false;
        }

        return notifications.update(notificationId, {
            type: BrowserNotificationService.CROSS_BROWSER_NOTIFICATION_TYPE,
            iconUrl: browser.runtime.getURL(BrowserNotificationService.ICON_PATH),
            title: title,
            message: message
        });
    }

    public async clearNotifications(): Promise<void> {
        while (this.notifications.length > 0) {
            const id = this.notifications.shift();
            if (id){
                await browser.notifications.clear(id);
            }
        }
    }

    private async createNotification(iconPath: string, title: string, message: string): Promise<string> {
        const notificationId = this.getNotificationId();

        await browser.notifications.create(notificationId, {
            type: BrowserNotificationService.CROSS_BROWSER_NOTIFICATION_TYPE,
            iconUrl: browser.runtime.getURL(iconPath),
            title: title,
            message: message
        });

        this.notifications.push(notificationId);

        return notificationId;
    }

    private getNotificationId(): string {
        return "ID" + Math.random().toString(16).slice(2) + "-" + (new Date()).getTime();
    }
}
