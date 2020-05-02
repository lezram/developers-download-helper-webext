import {container} from "tsyringe";
import {Arg, SubstituteOf} from "@fluffy-spoon/substitute";
import {ContextMenuActionService} from "../../../src/service/context-menu/ContextMenuActionService";
import {Action} from "../../../src/model/Action";
import {Mo} from "../../test-support/Mo";
import {DownloaderRegistry} from "../../../src/service/downloader/DownloaderRegistry";
import {ChromeNotificationService} from "../../../src/service/chrome/ChromeNotificationService";
import {ChromeDownloadService} from "../../../src/service/chrome/ChromeDownloadService";
import {Downloader} from "../../../src/service/downloader/Downloader";
import {TestUtil} from "../../test-support/TestUtil";
import {ResourceNotAccessibleException} from "../../../src/exception/ResourceNotAccessibleException";

describe("ContextMenuActionServiceTest", (): void => {
    const URL_STRING: string = "http://somelink.github.com/test/test/" + TestUtil.randomString();
    const URL_OBJ: URL = new URL(URL_STRING);
    const DOWNLOADER_ID = TestUtil.randomString();

    let testee: ContextMenuActionService;
    let chromeDownloadServiceMock: SubstituteOf<ChromeDownloadService>;
    let chromeNotificationServiceMock: SubstituteOf<ChromeNotificationService>;
    let downloaderRegistryMock: SubstituteOf<DownloaderRegistry>;

    beforeEach((): void => {
        container.reset();

        chromeDownloadServiceMock = Mo.injectMock(ChromeDownloadService);
        chromeNotificationServiceMock = Mo.injectMock(ChromeNotificationService);
        downloaderRegistryMock = Mo.injectMock(DownloaderRegistry);

        testee = container.resolve(ContextMenuActionService);
    });

    test("testGetMenuItemAction", async (): Promise<void> => {
        let downloaderMock = Mo.mock<Downloader>();
        downloaderRegistryMock.getDownloader(DOWNLOADER_ID).returns(downloaderMock);

        let action = testee.getMenuItemAction(Action.SAVE_AS, DOWNLOADER_ID);
        await action({
            menuItemId: "",
            editable: false,
            pageUrl: "",
            linkUrl: URL_STRING
        }, null);

        chromeNotificationServiceMock.received(1).showProgressNotification(Arg.all());
        downloaderMock.received(1).getFile({
            action: Action.SAVE_AS,
            url: URL_OBJ
        });
        chromeDownloadServiceMock.received(1).downloadFile(Arg.any(), true);
        chromeNotificationServiceMock.received(2).updateProgressNotification(Arg.all());
        chromeNotificationServiceMock.received(1).clearNotifications();
    });

    test("testGetMenuItemActionDownload", async (): Promise<void> => {
        let downloaderMock = Mo.mock<Downloader>();
        downloaderRegistryMock.getDownloader(DOWNLOADER_ID).returns(downloaderMock);

        let action = testee.getMenuItemAction(Action.DOWNLOAD, DOWNLOADER_ID);
        await action({
            menuItemId: "",
            editable: false,
            pageUrl: "",
            linkUrl: URL_STRING
        }, null);

        chromeNotificationServiceMock.received(1).showProgressNotification(Arg.all());
        downloaderMock.received(1).getFile({
            action: Action.DOWNLOAD,
            url: URL_OBJ
        });
        chromeDownloadServiceMock.received(1).downloadFile(Arg.any(), false);
        chromeNotificationServiceMock.received(2).updateProgressNotification(Arg.all());
        chromeNotificationServiceMock.received(1).clearNotifications();
    });

    test("testGetMenuItemActionGetFileFailed", async (): Promise<void> => {
        let downloaderMock = Mo.mock<Downloader>();
        downloaderMock.getFile(Arg.any()).throws(new Error());
        downloaderRegistryMock.getDownloader(DOWNLOADER_ID).returns(downloaderMock);

        let action = testee.getMenuItemAction(Action.SAVE_AS, DOWNLOADER_ID);
        await action({
            menuItemId: "",
            editable: false,
            pageUrl: "",
            linkUrl: URL_STRING
        }, null);

        chromeNotificationServiceMock.received(1).showProgressNotification(Arg.all());
        chromeNotificationServiceMock.received(1).clearNotifications();
        chromeNotificationServiceMock.received(1).showErrorNotification(Arg.all());
        chromeDownloadServiceMock.received(0).downloadFile(Arg.any(), true);
    });

    test("testGetMenuItemActionGetFileResourceNotAccessible", async (): Promise<void> => {
        let downloaderMock = Mo.mock<Downloader>();
        downloaderMock.getFile(Arg.any()).throws(new ResourceNotAccessibleException(""));
        downloaderRegistryMock.getDownloader(DOWNLOADER_ID).returns(downloaderMock);

        let action = testee.getMenuItemAction(Action.SAVE_AS, DOWNLOADER_ID);
        await action({
            menuItemId: "",
            editable: false,
            pageUrl: "",
            linkUrl: URL_STRING
        }, null);

        chromeNotificationServiceMock.received(1).showProgressNotification(Arg.all());
        chromeNotificationServiceMock.received(1).clearNotifications();
        chromeNotificationServiceMock.received(1).showErrorNotification(Arg.all());
        chromeDownloadServiceMock.received(0).downloadFile(Arg.any(), true);
    });

    test("testGetMenuItemActionDownloadFailed", async (): Promise<void> => {
        let downloaderMock = Mo.mock<Downloader>();
        downloaderRegistryMock.getDownloader(DOWNLOADER_ID).returns(downloaderMock);
        chromeDownloadServiceMock.downloadFile(Arg.all()).throws(new Error("test"));

        let action = testee.getMenuItemAction(Action.SAVE_AS, DOWNLOADER_ID);
        await action({
            menuItemId: "",
            editable: false,
            pageUrl: "",
            linkUrl: URL_STRING
        }, null);

        chromeNotificationServiceMock.received(1).showProgressNotification(Arg.all());
        downloaderMock.received(1).getFile({
            action: Action.SAVE_AS,
            url: URL_OBJ
        });
        chromeDownloadServiceMock.received(1).downloadFile(Arg.any(), true);
        chromeNotificationServiceMock.received(1).clearNotifications();
        chromeNotificationServiceMock.received(1).showErrorNotification(Arg.all());
    });

    test("testGetMenuItemActionDownloadFailedWithoutError", async (): Promise<void> => {
        let downloaderMock = Mo.mock<Downloader>();
        downloaderRegistryMock.getDownloader(DOWNLOADER_ID).returns(downloaderMock);
        chromeDownloadServiceMock.downloadFile(Arg.all()).throws(null);

        let action = testee.getMenuItemAction(Action.SAVE_AS, DOWNLOADER_ID);
        await action({
            menuItemId: "",
            editable: false,
            pageUrl: "",
            linkUrl: URL_STRING
        }, null);

        chromeNotificationServiceMock.received(1).showProgressNotification(Arg.all());
        downloaderMock.received(1).getFile({
            action: Action.SAVE_AS,
            url: URL_OBJ
        });
        chromeDownloadServiceMock.received(1).downloadFile(Arg.any(), true);
        chromeNotificationServiceMock.received(1).clearNotifications();
        chromeNotificationServiceMock.received(1).showErrorNotification(Arg.all());
    });

});