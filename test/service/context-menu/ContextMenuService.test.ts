import {container} from "tsyringe";
import {Arg, SubstituteOf} from "@fluffy-spoon/substitute";
import {ContextMenuActionService} from "../../../src/service/context-menu/ContextMenuActionService";
import {ChromeContextMenuService} from "../../../src/service/chrome/ChromeContextMenuService";
import {ContextMenuService} from "../../../src/service/context-menu/ContextMenuService";
import {Action} from "../../../src/model/Action";
import {Mo} from "../../test-support/Mo";
import {DownloaderRegistry} from "../../../src/service/downloader/DownloaderRegistry";
import {ConfigurationService} from "../../../src/service/ConfigurationService";
import {ActionItemMetadata} from "../../../src/model/ActionItemMetadata";
import {DownloaderMetadata} from "../../../src/model/DownloaderMetadata";
import OnClickData = chrome.contextMenus.OnClickData;

describe("ContextMenuServiceTest", (): void => {
    const ACTION_FUNCTION_MOCK = async (info: OnClickData, tab: chrome.tabs.Tab): Promise<void> => {
    };
    const URL: string = "any-url";
    const DOWNLOAD_TITLE: string = "Download";
    const ACTION_ITEM: ActionItemMetadata = {
        id: Action.DOWNLOAD,
        title: DOWNLOAD_TITLE,
        defaultActive: true
    };
    const DOWNLOADER: DownloaderMetadata = {
        id: "test",
        name: "test",
        allowCustomUrls: false,
        configuration: {
            linkPatterns: [URL],
            permissions: []
        }
    };


    let testee: ContextMenuService;
    let contextMenuActionServiceMock: SubstituteOf<ContextMenuActionService>;
    let chromeContextMenuServiceMock: SubstituteOf<ChromeContextMenuService>;
    let downloaderRegistryMock: SubstituteOf<DownloaderRegistry>;
    let configurationServiceMock: SubstituteOf<ConfigurationService>;

    beforeEach((): void => {
        container.reset();

        contextMenuActionServiceMock = Mo.injectMock(ContextMenuActionService);
        chromeContextMenuServiceMock = Mo.injectMock(ChromeContextMenuService);
        downloaderRegistryMock = Mo.injectMock(DownloaderRegistry);
        configurationServiceMock = Mo.injectMock(ConfigurationService);

        testee = container.resolve(ContextMenuService);
    });

    test("testCreateContextMenus", async (): Promise<void> => {
        configurationServiceMock.getActiveActionItems().resolves([ACTION_ITEM]);
        downloaderRegistryMock.getAllDownloadersMetadata().returns([DOWNLOADER]);
        configurationServiceMock.getDownloaderCustomConfiguration(Arg.any()).resolves(null);
        contextMenuActionServiceMock.getMenuItemAction(Arg.all()).returns(ACTION_FUNCTION_MOCK);

        await testee.createContextMenus();

        chromeContextMenuServiceMock.received(1).addContextMenu({
            title: DOWNLOAD_TITLE,
            action: Action.DOWNLOAD,
            urlPatterns: [URL],
            onclick: ACTION_FUNCTION_MOCK
        });
    });

    test("testUpdateContextMenus", async (): Promise<void> => {
        configurationServiceMock.getActiveActionItems().resolves([ACTION_ITEM]);
        downloaderRegistryMock.getAllDownloadersMetadata().returns([DOWNLOADER]);
        configurationServiceMock.getDownloaderCustomConfiguration(Arg.any()).resolves(null);
        contextMenuActionServiceMock.getMenuItemAction(Arg.all()).returns(ACTION_FUNCTION_MOCK);


        await testee.updateContextMenus();

        chromeContextMenuServiceMock.received(1).clearAllContextMenus();
        chromeContextMenuServiceMock.received(1).addContextMenu({
            title: DOWNLOAD_TITLE,
            action: Action.DOWNLOAD,
            urlPatterns: [URL],
            onclick: ACTION_FUNCTION_MOCK
        });
    });

    test("testCreateContextMenusWithIncompleteConfiguration", async (): Promise<void> => {
        configurationServiceMock.getActiveActionItems().resolves([]);
        downloaderRegistryMock.getAllDownloadersMetadata().returns([]);

        await testee.createContextMenus();

        chromeContextMenuServiceMock.didNotReceive().addContextMenu(Arg.all());
    });
});