import {container} from "tsyringe";
import {ChromeContextMenuService} from "../../../src/service/chrome/ChromeContextMenuService";
import {Action} from "../../../src/model/Action";
import {TestUtil} from "../../test-support/TestUtil";

describe("ChromeContextMenuServiceTest", (): void => {
    const URL = "https://test.localhost/*";
    const TITLE: string = TestUtil.randomString();

    let testee: ChromeContextMenuService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(ChromeContextMenuService);
    });

    test("testAddContextMenu", async (): Promise<void> => {
        const onClickMock = jest.fn();
        const createMock = jest.fn();

        global["chrome"] = {
            contextMenus: {
                create: createMock
            }
        }

        await testee.addContextMenu({
            action: Action.DOWNLOAD,
            title: TITLE,
            urlPatterns: [URL],
            onclick: onClickMock
        });

        expect(createMock).toBeCalledTimes(1);
        expect(createMock).toBeCalledWith({
            type: "normal",
            title: TITLE,
            targetUrlPatterns: [URL],
            documentUrlPatterns: ["<all_urls>"],
            contexts: ["link"],
            onclick: onClickMock
        });
    });

    test("testClearAllContextMenus", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();

        await testee.clearAllContextMenus();

        expect(chrome.contextMenus.removeAll).toBeCalledTimes(1);
    });

});