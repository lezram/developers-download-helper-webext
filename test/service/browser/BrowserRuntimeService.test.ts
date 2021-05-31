import {container} from "tsyringe";
import {BrowserRuntimeService} from "../../../src/service/browser/BrowserRuntimeService";

describe("BrowserRuntimeServiceTest", (): void => {
    const URL: string = "https://test.localhost/";

    let testee: BrowserRuntimeService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserRuntimeService);
    });

    test("testGetHomePageUrl", (): void => {
        mockBrowser.runtime.getManifest.expect.andReturn({
            homepage_url: URL,
            manifest_version: 0,
            name: "",
            version: ""
        }).times(1)

        let url = testee.getHomePageUrl();

        expect(url).toBe(URL);
    });

    test("testGetHomePageUrlEmpty", (): void => {
        mockBrowser.runtime.getManifest.expect.andReturn({
            homepage_url: null,
            manifest_version: 0,
            name: "",
            version: ""
        }).times(1)


        let url = testee.getHomePageUrl();

        expect(url).toBe("");
    });

});
