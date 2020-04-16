import {singleton} from "tsyringe";

@singleton()
export class ChromeNotificationService {
    private static notifications = [];

    public showErrorNotification(title: string, message: string) {
        this.clearNotifications();

        const notificationId = this.getNotificationId();

        chrome.notifications.create(notificationId, {
            type: "basic",
            iconUrl: "images/icon-red-48.png",
            title: title,
            message: message,
            requireInteraction: true,
        });

        ChromeNotificationService.notifications.push(notificationId);
    }

    public showProgressNotification(progress: number, title: string, message: string): string {
        const notificationId = this.getNotificationId();

        chrome.notifications.create(notificationId, {
            type: "progress",
            iconUrl: "images/icon-48.png",
            title: title,
            message: message,
            progress: progress,
            requireInteraction: false
        });

        ChromeNotificationService.notifications.push(notificationId);

        return notificationId;
    }

    public updateProgressNotification(notificationId: string, progress: number, title: string, message: string) {
        chrome.notifications.update(notificationId, {
            type: "progress",
            iconUrl: "images/icon-48.png",
            title: title,
            message: message,
            progress: progress,
            requireInteraction: false
        });
    }

    public clearNotifications(): void {
        while (ChromeNotificationService.notifications.length > 0) {
            const id = ChromeNotificationService.notifications.shift();
            chrome.notifications.clear(id);
        }
    }

    private getNotificationId(): string {
        return "ID" + Math.random().toString(16).slice(2) + "-" + (new Date()).getTime();
    }
}