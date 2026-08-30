import {container} from "tsyringe";
import {BrowserActionService} from "../../../src/service/browser/BrowserActionService";
import * as browserMock from "../../test-support/BrowserMock";

describe("BrowserActionServiceTest", (): void => {

    let testee: BrowserActionService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserActionService);
    });

    test("testAddOnClickListener", async (): Promise<void> => {
        const onClick = jest.fn();

        testee.addOnClickListener(onClick);

        expect(browserMock.action.onClicked.addListener).toHaveBeenCalledTimes(1);

        const registeredListener = browserMock.action.onClicked.addListener.mock.calls[0][0];
        await registeredListener();

        expect(onClick).toHaveBeenCalledTimes(1);
    });

});
