import {singleton} from "tsyringe";
import {browser} from "webextension-polyfill-ts";

@singleton()
export class BrowserNotificationService {
    private notifications = [];

    public async showErrorNotification(title: string, message: string): Promise<void> {
        await this.clearNotifications();

        const notificationId = this.getNotificationId();

        await browser.notifications.create(notificationId, {
            type: "basic",
            iconUrl: "images/icon-red-48.png",
            title: title,
            message: message
        });

        this.notifications.push(notificationId);
    }

    public async showProgressNotification(progress: number, title: string, message: string): Promise<string> {
        const notificationId = this.getNotificationId();

        await browser.notifications.create(notificationId, {
            type: "progress",
            iconUrl: "images/icon-48.png",
            title: title,
            message: message,
            progress: progress,
        });

        this.notifications.push(notificationId);

        return notificationId;
    }

    // TODO: fix update
    public async updateProgressNotification(notificationId: string, progress: number, title: string, message: string): Promise<void> {
        // await browser.notifications.update(notificationId, {
        //     type: "progress",
        //     iconUrl: "images/icon-48.png",
        //     title: title,
        //     message: message,
        //     progress: progress,
        //     requireInteraction: false
        // });
    }

    public async clearNotifications(): Promise<void> {
        while (this.notifications.length > 0) {
            const id = this.notifications.shift();
            await browser.notifications.clear(id);
        }
    }

    private getNotificationId(): string {
        return "ID" + Math.random().toString(16).slice(2) + "-" + (new Date()).getTime();
    }
}
