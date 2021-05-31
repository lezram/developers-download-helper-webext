import {container} from "tsyringe";
import {BackgroundService} from "../../src/service/BackgroundService";
import {Arg, Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {ConfigurationService} from "../../src/service/ConfigurationService";
import {ContextMenuService} from "../../src/service/context-menu/ContextMenuService";
import {Configuration} from "../../src/model/Configuration";
import {Mo} from "../test-support/Mo";

describe("BackgroundServiceTest", (): void => {

    let testee: BackgroundService;
    let configurationServiceMock: SubstituteOf<ConfigurationService>;
    let contextMenuServiceMock: SubstituteOf<ContextMenuService>;

    beforeEach((): void => {
        container.reset();

        contextMenuServiceMock = Mo.injectMock(ContextMenuService);
        configurationServiceMock = Mo.injectMock(ConfigurationService);

        testee = container.resolve(BackgroundService);
    });

    test("testRun", async (): Promise<void> => {
        const configMock = Substitute.for<Configuration>();

        configurationServiceMock.getConfiguration().resolves(configMock);

        await testee.run();

        contextMenuServiceMock.received(1).createContextMenus();
        configurationServiceMock.received(1).addConfigurationChangeListener(Arg.any());
    });

    test("testRunWithChange", async (): Promise<void> => {
        const configMock = Substitute.for<Configuration>();

        configurationServiceMock.addConfigurationChangeListener(Arg.any()).mimicks(
            (onConfigurationChange: (configuration: Configuration) => Promise<void>) => {
                onConfigurationChange(configMock);
            }
        );

        await testee.run();

        contextMenuServiceMock.received(1).createContextMenus();
        configurationServiceMock.received(1).addConfigurationChangeListener(Arg.any());
        contextMenuServiceMock.received(1).updateContextMenus();
    });
});
