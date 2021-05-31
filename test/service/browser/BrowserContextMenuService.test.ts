import {container} from "tsyringe";
import {BrowserContextMenuService} from "../../../src/service/browser/BrowserContextMenuService";
import {Action} from "../../../src/model/Action";
import {TestUtil} from "../../test-support/TestUtil";

describe("BrowserContextMenuServiceTest", (): void => {
    const URL = "https://test.localhost/*";
    const TITLE: string = TestUtil.randomString();

    let testee: BrowserContextMenuService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserContextMenuService);
    });

    test("testAddContextMenu", async (): Promise<void> => {
        const onClickMock = jest.fn();

        mockBrowser.contextMenus.create.expect({
            type: "normal",
            title: TITLE,
            targetUrlPatterns: [URL],
            documentUrlPatterns: ["<all_urls>"],
            contexts: ["link"],
            onclick: onClickMock
        }).times(1);

        const result = testee.addContextMenu({
            action: Action.DOWNLOAD,
            title: TITLE,
            urlPatterns: [URL],
            onclick: onClickMock
        });

        await expect(result).resolves;
    });

    test("testClearAllContextMenus", async (): Promise<void> => {
        mockBrowser.contextMenus.removeAll.expect().times(1);

        await expect(testee.clearAllContextMenus()).resolves;
    });

});
