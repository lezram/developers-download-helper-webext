import {container} from "tsyringe";
import {SubstituteOf} from "@fluffy-spoon/substitute";
import {OptionService} from "../src/service/OptionService";
import {Mo} from "./test-support/Mo";

describe("chrome-options Test", () => {

    let optionServiceMock: SubstituteOf<OptionService>;

    beforeEach(() => {
        container.reset();

        optionServiceMock = Mo.injectMock(OptionService);
    });

    test("test", async () => {
        require("../src/chrome-options");

        optionServiceMock.received(1).showAndHandleOptions();
    });
});