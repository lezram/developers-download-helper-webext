import {container} from "tsyringe";
import {Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {BackgroundService} from "../src/service/BackgroundService";

describe("chrome-background Test", () => {

    let backgroundServiceMock: SubstituteOf<BackgroundService>;

    beforeEach(() => {
        container.reset();

        backgroundServiceMock = Substitute.for<BackgroundService>();
        container.register(BackgroundService, {useValue: backgroundServiceMock});
    });


    test("test", async () => {
        require("../src/chrome-background");

        backgroundServiceMock.received(1).run();
    });


});