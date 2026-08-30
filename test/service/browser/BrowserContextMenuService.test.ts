import {container} from "tsyringe";
import {BrowserContextMenuService} from "../../../src/service/browser/BrowserContextMenuService";
import {Action} from "../../../src/model/Action";
import {TestUtil} from "../../test-support/TestUtil";
import * as browserMock from "../../test-support/BrowserMock";

describe("BrowserContextMenuServiceTest", (): void => {
    const URL = "https://test.localhost/*";
    const TITLE: string = TestUtil.randomString();
    const ID: string = "DOWNLOAD|test";

    let testee: BrowserContextMenuService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserContextMenuService);
    });

    test("testAddContextMenu", (): void => {
        testee.addContextMenu({
            id: ID,
            action: Action.DOWNLOAD,
            title: TITLE,
            urlPatterns: [URL]
        });

        expect(browserMock.contextMenus.create).toHaveBeenCalledTimes(1);
        expect(browserMock.contextMenus.create).toHaveBeenCalledWith({
            id: ID,
            type: "normal",
            title: TITLE,
            targetUrlPatterns: [URL],
            documentUrlPatterns: ["<all_urls>"],
            contexts: ["link"]
        });
    });

    test("testClearAllContextMenus", async (): Promise<void> => {
        await testee.clearAllContextMenus();

        expect(browserMock.contextMenus.removeAll).toHaveBeenCalledTimes(1);
    });

    test("testAddOnClickListener", async (): Promise<void> => {
        const onClick = jest.fn();
        const info = {menuItemId: ID};
        const tab = {index: 0};

        testee.addOnClickListener(onClick);

        expect(browserMock.contextMenus.onClicked.addListener).toHaveBeenCalledTimes(1);

        const registeredListener = browserMock.contextMenus.onClicked.addListener.mock.calls[0][0];
        await registeredListener(info, tab);

        expect(onClick).toHaveBeenCalledWith(info, tab);
    });

});
