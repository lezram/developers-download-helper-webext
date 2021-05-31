import {container} from "tsyringe";
import {SubstituteOf} from "@fluffy-spoon/substitute";
import {BackgroundService} from "../src/service/BackgroundService";
import {Mo} from "./test-support/Mo";

describe("browser-background Test", () => {

    let backgroundServiceMock: SubstituteOf<BackgroundService>;

    beforeEach(() => {
        container.reset();
        backgroundServiceMock = Mo.injectMock(BackgroundService);
    });

    test("test", async () => {
        require("../src/background");

        backgroundServiceMock.received(1).run();
    });
});
