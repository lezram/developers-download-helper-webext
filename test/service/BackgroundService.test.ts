import {container} from "tsyringe";
import {BackgroundService} from "../../src/service/BackgroundService";
import {Arg, Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {ConfigurationService} from "../../src/service/ConfigurationService";
import {ContextMenuService} from "../../src/service/context-menu/ContextMenuService";
import {Configuration} from "../../src/model/Configuration";
import {Mo} from "../test-support/Mo";
import {BrowserActionService} from "../../src/service/browser/BrowserActionService";
import {BrowserRuntimeService} from "../../src/service/browser/BrowserRuntimeService";

describe("BackgroundServiceTest", (): void => {

    let testee: BackgroundService;
    let configurationServiceMock: SubstituteOf<ConfigurationService>;
    let contextMenuServiceMock: SubstituteOf<ContextMenuService>;
    let browserActionServiceMock: SubstituteOf<BrowserActionService>;
    let browserRuntimeServiceMock: SubstituteOf<BrowserRuntimeService>;

    beforeEach((): void => {
        container.reset();

        contextMenuServiceMock = Mo.injectMock(ContextMenuService);
        configurationServiceMock = Mo.injectMock(ConfigurationService);
        browserActionServiceMock = Mo.injectMock(BrowserActionService);
        browserRuntimeServiceMock = Mo.injectMock(BrowserRuntimeService);

        testee = container.resolve(BackgroundService);
    });

    test("testRun", async (): Promise<void> => {
        const configMock = Substitute.for<Configuration>();

        configurationServiceMock.getConfiguration().resolves(configMock);

        await testee.run();

        contextMenuServiceMock.received(1).createContextMenus();
    });

    test("testRegisterListeners", (): void => {
        testee.registerListeners();

        contextMenuServiceMock.received(1).registerContextMenuClickListener();
        configurationServiceMock.received(1).addConfigurationChangeListener(Arg.any());
        browserActionServiceMock.received(1).addOnClickListener(Arg.any());
    });

    test("testRegisterListenersOpensOptionsOnActionClick", async (): Promise<void> => {
        let registeredListener: () => Promise<void> = null;
        browserActionServiceMock.addOnClickListener(Arg.any()).mimicks((onClick: () => Promise<void>): void => {
            registeredListener = onClick;
        });

        testee.registerListeners();

        await registeredListener();

        browserRuntimeServiceMock.received(1).openOptionsPage();
    });

    test("testRegisterListenersWithChange", async (): Promise<void> => {
        const configMock = Substitute.for<Configuration>();

        configurationServiceMock.addConfigurationChangeListener(Arg.any()).mimicks(
            (onConfigurationChange: (configuration: Configuration) => Promise<void>) => {
                onConfigurationChange(configMock);
            }
        );

        testee.registerListeners();

        configurationServiceMock.received(1).addConfigurationChangeListener(Arg.any());
        contextMenuServiceMock.received(1).updateContextMenus();
    });
});
