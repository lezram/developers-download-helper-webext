import {container} from "tsyringe";
import {BrowserNotificationService} from "../../../src/service/browser/BrowserNotificationService";
import * as browserMock from "../../test-support/BrowserMock";

describe("BrowserNotificationServiceTest", (): void => {
    const EXTENSION_URL = "chrome-extension://test/";

    let testee: BrowserNotificationService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserNotificationService);
    });

    test("testShowErrorNotification", async (): Promise<void> => {
        browserMock.runtime.getURL.mockImplementation((path: string) => EXTENSION_URL + path);

        await expect(testee.showErrorNotification("test", "test")).resolves.toBeUndefined();

        expect(browserMock.notifications.create).toHaveBeenCalledTimes(1);
        expect(browserMock.notifications.create).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            iconUrl: EXTENSION_URL + "images/icon-red-48.png"
        }));
    });

    test("testShowProgressNotification", async (): Promise<void> => {
        browserMock.runtime.getURL.mockImplementation((path: string) => EXTENSION_URL + path);

        const notificationId = await testee.showProgressNotification("test", "test");

        expect(notificationId).toBeTruthy();
        expect(browserMock.notifications.create).toHaveBeenCalledTimes(1);
        expect(browserMock.notifications.create).toHaveBeenCalledWith(notificationId, expect.objectContaining({
            iconUrl: EXTENSION_URL + "images/icon-48.png"
        }));
    });

    test("testUpdateProgressNotificationWithUpdateSupport", async (): Promise<void> => {
        browserMock.runtime.getURL.mockImplementation((path: string) => EXTENSION_URL + path);
        browserMock.notifications.update.mockResolvedValue(true);

        const notificationId = await testee.showProgressNotification("test", "test");

        await expect(testee.updateProgressNotification(notificationId, "test1", "test2")).resolves.toBe(notificationId);

        expect(browserMock.notifications.update).toHaveBeenCalledWith(notificationId, expect.objectContaining({
            type: "basic",
            message: "test2"
        }));
        expect(browserMock.notifications.create).toHaveBeenCalledTimes(1);
    });

    test("testUpdateProgressNotificationWithoutUpdateSupport", async (): Promise<void> => {
        browserMock.runtime.getURL.mockImplementation((path: string) => EXTENSION_URL + path);
        browserMock.notifications.update.mockResolvedValue(false);

        const notificationId = await testee.showProgressNotification("test", "test");
        const updatedNotificationId = await testee.updateProgressNotification(notificationId, "test1", "test2");

        expect(updatedNotificationId).toBeTruthy();
        expect(updatedNotificationId).not.toBe(notificationId);
        expect(browserMock.notifications.clear).toHaveBeenCalledWith(notificationId);
        expect(browserMock.notifications.create).toHaveBeenCalledTimes(2);
    });

    test("testClearNotifications", async (): Promise<void> => {
        await testee.showProgressNotification("test", "test");
        await testee.showProgressNotification("test1", "test2");

        await expect(testee.clearNotifications()).resolves.toBeUndefined();

        expect(browserMock.notifications.create).toHaveBeenCalledTimes(2);
        expect(browserMock.notifications.clear).toHaveBeenCalledTimes(2);
    });

});
