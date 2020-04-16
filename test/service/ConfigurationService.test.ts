import {container} from "tsyringe";
import {Arg, SubstituteOf} from "@fluffy-spoon/substitute";
import {ConfigurationService} from "../../src/service/ConfigurationService";
import {Configuration, ContextMenuItemConfiguration} from "../../src/model/Configuration";
import {ExtensionConfiguration} from "../../src/configuration/ExtensionConfiguration";
import {ChromeStorageService} from "../../src/service/chrome/ChromeStorageService";
import {Action} from "../../src/model/Action";
import {ConfigurationMigrationService} from "../../src/service/ConfigurationMigrationService";
import {Mo} from "../test-support/Mo";

describe("ConfigurationServiceTest", (): void => {

    let testee: ConfigurationService;
    let configurationMigrationService: SubstituteOf<ConfigurationMigrationService>;
    let extensionConfigurationMock: SubstituteOf<ExtensionConfiguration>;
    let chromeStorageServiceMock: SubstituteOf<ChromeStorageService>;

    beforeEach((): void => {
        container.reset();

        configurationMigrationService = Mo.injectMock(ConfigurationMigrationService);
        extensionConfigurationMock = Mo.injectMock(ExtensionConfiguration);
        chromeStorageServiceMock = Mo.injectMock(ChromeStorageService);

        testee = container.resolve(ConfigurationService);
    });

    test("testGetConfiguration", async (): Promise<void> => {
        const contextMenu = new Map<Action, ContextMenuItemConfiguration>()
        contextMenu.set(Action.DOWNLOAD, {active: false});
        contextMenu.set(Action.SAVE_AS, {active: false});


        const configuration: Configuration = {
            contextMenu: contextMenu,
            downloader: new Map()
        };
        chromeStorageServiceMock.load(Arg.any()).returns(Promise.resolve(configuration));

        const result = await testee.getConfiguration();

        chromeStorageServiceMock.received(1).load(Arg.any());
        expect(result).toEqual(configuration);
    });

    test("testSaveConfiguration", async (): Promise<void> => {
        const contextMenu = new Map<Action, ContextMenuItemConfiguration>()
        contextMenu.set(Action.DOWNLOAD, {active: false});
        contextMenu.set(Action.SAVE_AS, {active: false});

        const configuration: Configuration = {
            contextMenu: contextMenu,
            downloader: new Map()
        };

        await testee.saveConfiguration(configuration);

        chromeStorageServiceMock.received(1).save({
            contextMenu: [
                [Action.DOWNLOAD, {active: false}],
                [Action.SAVE_AS, {active: false}]
            ],
            downloader: []
        });
    });

    test("testAddConfigurationChangeListener", async (): Promise<void> => {

        testee.addConfigurationChangeListener(jest.fn());

        chromeStorageServiceMock.received(1).addOnChangeListener(Arg.any());
    });

});