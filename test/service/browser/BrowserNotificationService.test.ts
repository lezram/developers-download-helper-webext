import {container} from "tsyringe";
import {BrowserNotificationService} from "../../../src/service/browser/BrowserNotificationService";

describe("BrowserNotificationServiceTest", (): void => {

    let testee: BrowserNotificationService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserNotificationService);
    });

    test("testShowErrorNotification", async (): Promise<void> => {
        mockBrowser.notifications.create.expect.andResolve("").times(1);;

        await expect(testee.showErrorNotification("test", "test")).resolves
    });

    test("testShowProgressNotification", async (): Promise<void> => {
        mockBrowser.notifications.create.expect.andResolve("").times(1);;

        await expect(testee.showProgressNotification(10, "test", "test")).resolves
    });

    // test("testUpdateProgressNotification", (): Promise<void> => {
    //     mockBrowser.notifications.update.expect.andResolve("");
    //
    //     await expect(testee.updateProgressNotification("id", 10, "test", "test")).toBeCalledTimes(1);
    // });

    test("testClearNotifications", async (): Promise<void> => {
        mockBrowser.notifications.create.expect.andResolve("").times(2);
        mockBrowser.notifications.clear.expect.andResolve(true).times(2);

        await testee.showProgressNotification(10, "test", "test");
        await testee.showProgressNotification(10, "test1", "test2");

        await expect(testee.clearNotifications()).resolves
    });

});
