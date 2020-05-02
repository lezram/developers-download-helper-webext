import {container} from "tsyringe";
import {ChromePermissionService} from "../../../src/service/chrome/ChromePermissionService";
import {TestUtil} from "../../test-support/TestUtil";

describe("ChromePermissionServiceTest", (): void => {

    let testee: ChromePermissionService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(ChromePermissionService);
    });

    test("testRequestUrlPermission", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();

        await testee.requestUrlPermission([]);

        expect(chrome.permissions.request).toBeCalledTimes(1);
    });

    test("testRequestUrlPermissionFailed", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();
        chrome.runtime.lastError = true;

        const granted = await testee.requestUrlPermission([]);

        expect(granted).toBeFalsy();
        expect(chrome.permissions.request).toBeCalledTimes(1);
    });

});