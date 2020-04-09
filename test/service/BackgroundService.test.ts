import {container} from "tsyringe";
import {BackgroundService} from "../../src/service/BackgroundService";
import {Arg, Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {ConfigurationService} from "../../src/service/ConfigurationService";
import {ContextMenuService} from "../../src/service/context-menu/ContextMenuService";
import {Configuration} from "../../src/model/Configuration";

describe("BackgroundServiceTest", (): void => {

    let testee: BackgroundService;
    let configurationServiceMock: SubstituteOf<ConfigurationService>;
    let contextMenuServiceMock: SubstituteOf<ContextMenuService>;

    beforeEach((): void => {
        container.reset();

        configurationServiceMock = Substitute.for<ConfigurationService>();
        container.register(ConfigurationService, {useValue: configurationServiceMock});

        contextMenuServiceMock = Substitute.for<ContextMenuService>();
        container.register(ContextMenuService, {useValue: contextMenuServiceMock});

        testee = container.resolve(BackgroundService);
    });

    test("testRun", async (): Promise<void> => {
        const configMock = Substitute.for<Configuration>();

        configurationServiceMock.getConfiguration().returns(Promise.resolve(configMock));

        await testee.run();

        configurationServiceMock.received(1).getConfiguration();
        contextMenuServiceMock.received(1).createContextMenus(configMock);
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

        configurationServiceMock.received(1).getConfiguration();
        contextMenuServiceMock.received(1).createContextMenus(Arg.any());
        configurationServiceMock.received(1).addConfigurationChangeListener(Arg.any());
        contextMenuServiceMock.received(1).updateContextMenus(Arg.any());
    });
});