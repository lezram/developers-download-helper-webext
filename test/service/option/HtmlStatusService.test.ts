import {container} from "tsyringe";
import {HtmlStatusService} from "../../../src/service/option/HtmlStatusService";
import {BrowserRuntimeService} from "../../../src/service/browser/BrowserRuntimeService";
import {Mo} from "../../test-support/Mo";
import {JSDOM} from 'jsdom';
import {SubstituteOf} from "@fluffy-spoon/substitute";
import {TestUtil} from "../../test-support/TestUtil";

describe("HtmlStatusServiceTest", (): void => {
    const URL: string = "https://git.repo.url.localhost/" + TestUtil.randomString(5);
    const MESSAGE: string = TestUtil.randomString();
    const ERROR_TEXT: string = TestUtil.randomString();
    const DETAILS_TEXT: string = TestUtil.randomString();
    const DOCUMENT: HTMLDocument = (new JSDOM(`...`)).window.document;

    let testee: HtmlStatusService;
    let browserRuntimeService: SubstituteOf<BrowserRuntimeService>;

    beforeEach((): void => {
        container.reset();

        browserRuntimeService = Mo.injectMock(BrowserRuntimeService);
        browserRuntimeService.getHomePageUrl().returns(URL);

        testee = container.resolve(HtmlStatusService);
    });

    test("testShowStatus", (): void => {
        jest.useFakeTimers();
        const element = DOCUMENT.createElement("div");

        testee.showStatus(element, MESSAGE);

        jest.runAllTimers();

        expect(element.innerHTML).not.toContain(URL);
        expect(element.innerHTML).toContain(MESSAGE);
        expect(element.style.display).toBe("none");
    });

    test("testShowStatusWithDetails", (): void => {
        const element = DOCUMENT.createElement("div");

        testee.showStatus(element, MESSAGE, {some: DETAILS_TEXT});

        expect(element.innerHTML).toContain(URL);
        expect(element.innerHTML).toContain(MESSAGE);
        expect(element.innerHTML).toContain(DETAILS_TEXT);
        expect(element.style.display).toBe("inline-block");
    });

    test("testShowStatusWithErrorDetails", (): void => {
        const element = DOCUMENT.createElement("div");

        testee.showStatus(element, MESSAGE, new Error(ERROR_TEXT));

        expect(element.innerHTML).toContain(URL);
        expect(element.innerHTML).toContain(MESSAGE);
        expect(element.innerHTML).toContain(ERROR_TEXT);
    });
});
