import {container} from "tsyringe";
import {Arg, Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {ContextMenuActionService} from "../../../src/service/context-menu/ContextMenuActionService";
import {ChromeContextMenuService} from "../../../src/service/chrome/ChromeContextMenuService";
import {ContextMenuService} from "../../../src/service/context-menu/ContextMenuService";
import {Configuration} from "../../../src/model/Configuration";
import {Action} from "../../../src/model/Action";
import OnClickData = chrome.contextMenus.OnClickData;

describe("ContextMenuServiceTest", (): void => {
    const ACTION_FUNCTION_MOCK = async (info: OnClickData, tab: chrome.tabs.Tab): Promise<void> => {
    };
    const URL: string = "any-url";
    const DOWNLOAD_TITLE = "Download";
    const DOWNLOADER_ID = "testId";
    const CONFIGURATION: Configuration = {
        downloader: [{
            id: DOWNLOADER_ID,
            urlPatterns: [URL],
            name: "john"
        }],
        contextMenu: [
            {
                id: Action.DOWNLOAD,
                active: true,
                title: "Download"
            },
            {
                id: Action.SAVE_AS,
                active: false,
                title: "Download"
            }
        ],
    };
    const INCOMPLETE_CONFIGURATION: Configuration = {
        downloader: [{
            id: DOWNLOADER_ID,
            urlPatterns: [],
            name: "john"
        }],
        contextMenu: [
            {
                id: Action.DOWNLOAD,
                active: true,
                title: "Download"
            },
            {
                id: Action.SAVE_AS,
                active: false,
                title: "Download"
            }
        ],
    };

    let testee: ContextMenuService;
    let contextMenuActionServiceMock: SubstituteOf<ContextMenuActionService>;
    let chromeContextMenuServiceMock: SubstituteOf<ChromeContextMenuService>;

    beforeEach((): void => {
        container.reset();

        contextMenuActionServiceMock = Substitute.for<ContextMenuActionService>();
        container.register(ContextMenuActionService, {useValue: contextMenuActionServiceMock});

        chromeContextMenuServiceMock = Substitute.for<ChromeContextMenuService>();
        container.register(ChromeContextMenuService, {useValue: chromeContextMenuServiceMock});

        testee = container.resolve(ContextMenuService);
    });

    test("testCreateContextMenus", async (): Promise<void> => {
        contextMenuActionServiceMock.getMenuItemAction(Arg.all()).returns(ACTION_FUNCTION_MOCK);

        testee.createContextMenus(CONFIGURATION);

        chromeContextMenuServiceMock.received(1).addContextMenu({
            title: DOWNLOAD_TITLE,
            action: Action.DOWNLOAD,
            urlPatterns: [URL],
            onclick: ACTION_FUNCTION_MOCK
        });
    });

    test("testUpdateContextMenus", async (): Promise<void> => {
        contextMenuActionServiceMock.getMenuItemAction(Arg.all()).returns(ACTION_FUNCTION_MOCK);

        testee.updateContextMenus(CONFIGURATION);

        chromeContextMenuServiceMock.received(1).clearAllContextMenus();
        chromeContextMenuServiceMock.received(1).addContextMenu({
            title: DOWNLOAD_TITLE,
            action: Action.DOWNLOAD,
            urlPatterns: [URL],
            onclick: ACTION_FUNCTION_MOCK
        });
    });

    test("testCreateContextMenusWithIncompleteConfiguration", async (): Promise<void> => {

        testee.createContextMenus(INCOMPLETE_CONFIGURATION);

        chromeContextMenuServiceMock.didNotReceive().addContextMenu(Arg.all());
    });
});