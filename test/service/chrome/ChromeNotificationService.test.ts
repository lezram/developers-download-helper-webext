import {container} from "tsyringe";
import {ChromeNotificationService} from "../../../src/service/chrome/ChromeNotificationService";
import {TestUtil} from "../../test-support/TestUtil";

describe("ChromeNotificationServiceTest", (): void => {

    let testee: ChromeNotificationService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(ChromeNotificationService);
    });

    test("testShowErrorNotification", (): void => {
        const chrome = TestUtil.initializeChromeContext();

        testee.showErrorNotification("test", "test");

        expect(chrome.notifications.create).toBeCalledTimes(1);
    });

    test("testShowProgressNotification", (): void => {
        const chrome = TestUtil.initializeChromeContext();

        testee.showProgressNotification(10, "test", "test");

        expect(chrome.notifications.create).toBeCalledTimes(1);
    });

    test("testUpdateProgressNotification", (): void => {
        const chrome = TestUtil.initializeChromeContext();

        testee.updateProgressNotification("id", 10, "test", "test");

        expect(chrome.notifications.update).toBeCalledTimes(1);
    });

    test("testClearNotifications", (): void => {
        const chrome = TestUtil.initializeChromeContext();

        testee.showProgressNotification(10, "test", "test");

        testee.clearNotifications();

        expect(chrome.notifications.clear).toBeCalledTimes(1);
    });

});