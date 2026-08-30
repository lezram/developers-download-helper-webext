import {container} from "tsyringe";
import {BrowserRuntimeService} from "../../../src/service/browser/BrowserRuntimeService";
import * as browserMock from "../../test-support/BrowserMock";

describe("BrowserRuntimeServiceTest", (): void => {
    const URL: string = "https://test.localhost/";

    let testee: BrowserRuntimeService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserRuntimeService);
    });

    test("testGetHomePageUrl", (): void => {
        browserMock.runtime.getManifest.mockReturnValue({
            homepage_url: URL,
            manifest_version: 3,
            name: "",
            version: ""
        });

        let url = testee.getHomePageUrl();

        expect(url).toBe(URL);
        expect(browserMock.runtime.getManifest).toHaveBeenCalledTimes(1);
    });

    test("testGetHomePageUrlEmpty", (): void => {
        browserMock.runtime.getManifest.mockReturnValue({
            homepage_url: null,
            manifest_version: 3,
            name: "",
            version: ""
        });

        let url = testee.getHomePageUrl();

        expect(url).toBe("");
        expect(browserMock.runtime.getManifest).toHaveBeenCalledTimes(1);
    });

    test("testOpenOptionsPage", async (): Promise<void> => {
        browserMock.runtime.openOptionsPage.mockResolvedValue(undefined);

        await expect(testee.openOptionsPage()).resolves.toBeUndefined();

        expect(browserMock.runtime.openOptionsPage).toHaveBeenCalledTimes(1);
    });

});
