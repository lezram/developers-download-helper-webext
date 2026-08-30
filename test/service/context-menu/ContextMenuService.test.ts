import { container } from "tsyringe";
import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { ContextMenuActionService } from "../../../src/service/context-menu/ContextMenuActionService";
import { BrowserContextMenuService } from "../../../src/service/browser/BrowserContextMenuService";
import { ContextMenuService } from "../../../src/service/context-menu/ContextMenuService";
import { Action } from "../../../src/model/Action";
import { Mo } from "../../test-support/Mo";
import { DownloaderRegistry } from "../../../src/service/downloader/DownloaderRegistry";
import { ConfigurationService } from "../../../src/service/ConfigurationService";
import { ActionItemMetadata } from "../../../src/model/ActionItemMetadata";
import { DownloaderMetadata } from "../../../src/model/DownloaderMetadata";
import { ContextMenuItemId, ContextOnClickAction } from "../../../src/model/ContextMenuItem";
import { Menus, Tabs } from "webextension-polyfill";
import OnClickData = Menus.OnClickData;

describe("ContextMenuServiceTest", (): void => {
    const ACTION_FUNCTION_MOCK = async (info: OnClickData, tab: Tabs.Tab): Promise<void> => {
    };
    const URL: string = "url1";
    const URL_1: string = "url2";
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
    const DOWNLOADER_EMPTY: DownloaderMetadata = {
        id: "test1",
        name: "test1",
        allowCustomUrls: false,
        configuration: {
            linkPatterns: [],
            permissions: []
        }
    };
    const DOWNLOADER_DISABLED: DownloaderMetadata = {
        id: "test2",
        name: "test2",
        allowCustomUrls: false,
        configuration: {
            linkPatterns: [URL_1],
            permissions: [],
            disabled: true
        }
    };

    let testee: ContextMenuService;
    let contextMenuActionServiceMock: SubstituteOf<ContextMenuActionService>;
    let browserContextMenuServiceMock: SubstituteOf<BrowserContextMenuService>;
    let downloaderRegistryMock: SubstituteOf<DownloaderRegistry>;
    let configurationServiceMock: SubstituteOf<ConfigurationService>;

    beforeEach((): void => {
        container.reset();

        contextMenuActionServiceMock = Mo.injectMock(ContextMenuActionService);
        browserContextMenuServiceMock = Mo.injectMock(BrowserContextMenuService);
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

        browserContextMenuServiceMock.received(1).addContextMenu({
            id: ContextMenuItemId.create(Action.DOWNLOAD, DOWNLOADER.id),
            title: DOWNLOAD_TITLE,
            action: Action.DOWNLOAD,
            urlPatterns: [URL]
        });
    });

    test("testUpdateContextMenus", async (): Promise<void> => {
        configurationServiceMock.getActiveActionItems().resolves([ACTION_ITEM]);
        downloaderRegistryMock.getAllDownloadersMetadata().returns([DOWNLOADER]);
        configurationServiceMock.getDownloaderCustomConfiguration(Arg.any()).resolves(null);
        contextMenuActionServiceMock.getMenuItemAction(Arg.all()).returns(ACTION_FUNCTION_MOCK);


        await testee.updateContextMenus();

        browserContextMenuServiceMock.received(1).clearAllContextMenus();
        browserContextMenuServiceMock.received(1).addContextMenu({
            id: ContextMenuItemId.create(Action.DOWNLOAD, DOWNLOADER.id),
            title: DOWNLOAD_TITLE,
            action: Action.DOWNLOAD,
            urlPatterns: [URL]
        });
    });

    test("testCreateContextMenusWithIncompleteConfiguration", async (): Promise<void> => {
        configurationServiceMock.getActiveActionItems().resolves([]);
        downloaderRegistryMock.getAllDownloadersMetadata().returns([]);

        await testee.createContextMenus();

        browserContextMenuServiceMock.didNotReceive().addContextMenu(Arg.all());
    });

    test("testCreateContextMenusWithIncompleteCustomConfiguration", async (): Promise<void> => {
        configurationServiceMock.getActiveActionItems().resolves([ACTION_ITEM]);
        downloaderRegistryMock.getAllDownloadersMetadata().returns([DOWNLOADER_EMPTY, DOWNLOADER_DISABLED]);
        configurationServiceMock.getDownloaderCustomConfiguration(Arg.any()).resolves({
            linkPatterns: [URL],
            permissions: [],
        });
        contextMenuActionServiceMock.getMenuItemAction(Arg.all()).returns(ACTION_FUNCTION_MOCK);

        await testee.createContextMenus();

        browserContextMenuServiceMock.received(1).addContextMenu({
            id: ContextMenuItemId.create(Action.DOWNLOAD, DOWNLOADER_EMPTY.id),
            title: DOWNLOAD_TITLE,
            action: Action.DOWNLOAD,
            urlPatterns: [URL]
        });
        browserContextMenuServiceMock.received(1).addContextMenu(Arg.any());
    });

    test("testRegisterContextMenuClickListener", async (): Promise<void> => {
        const clickAction = jest.fn();
        const tab = <Tabs.Tab>{index: 0};
        const info = <OnClickData>{menuItemId: ContextMenuItemId.create(Action.DOWNLOAD, DOWNLOADER.id)};

        let registeredListener: ContextOnClickAction = null;
        browserContextMenuServiceMock.addOnClickListener(Arg.any()).mimicks((listener: ContextOnClickAction): void => {
            registeredListener = listener;
        });
        contextMenuActionServiceMock.getMenuItemAction(Arg.all()).returns(clickAction);

        testee.registerContextMenuClickListener();

        await registeredListener(info, tab);

        contextMenuActionServiceMock.received(1).getMenuItemAction(Action.DOWNLOAD, DOWNLOADER.id);
        expect(clickAction).toHaveBeenCalledWith(info, tab);
    });

    test("testRegisterContextMenuClickListenerWithUnknownItem", async (): Promise<void> => {
        const info = <OnClickData>{menuItemId: "unknown"};

        let registeredListener: ContextOnClickAction = null;
        browserContextMenuServiceMock.addOnClickListener(Arg.any()).mimicks((listener: ContextOnClickAction): void => {
            registeredListener = listener;
        });

        testee.registerContextMenuClickListener();

        await registeredListener(info, <Tabs.Tab>{index: 0});

        contextMenuActionServiceMock.didNotReceive().getMenuItemAction(Arg.all());
    });
});
