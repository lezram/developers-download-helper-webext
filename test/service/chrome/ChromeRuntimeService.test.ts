import {container} from "tsyringe";
import {ChromeRuntimeService} from "../../../src/service/chrome/ChromeRuntimeService";

describe("ChromeRuntimeServiceTest", (): void => {
    const URL: string = "https://test.localhost/";

    let testee: ChromeRuntimeService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(ChromeRuntimeService);
    });

    test("testGetHomePageUrl", (): void => {
        global["chrome"] = {
            runtime: {
                getManifest: () => {
                    return {
                        homepage_url: URL
                    }
                }
            }
        };

        let url = testee.getHomePageUrl();

        expect(url).toBe(URL);
    });

    test("testGetHomePageUrlEmpty", (): void => {
        global["chrome"] = {
            runtime: {
                getManifest: () => {
                    return {
                        homepage_url: null
                    }
                }
            }
        }

        let url = testee.getHomePageUrl();

        expect(url).toBe("");
    });

});