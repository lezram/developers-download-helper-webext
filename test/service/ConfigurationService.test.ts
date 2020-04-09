import {container} from "tsyringe";
import {Arg, Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {ConfigurationService} from "../../src/service/ConfigurationService";
import {Configuration} from "../../src/model/Configuration";
import {ExtensionConfiguration} from "../../src/configuration/ExtensionConfiguration";
import {ChromeStorageService} from "../../src/service/chrome/ChromeStorageService";
import {Action} from "../../src/model/Action";
import {ConfigurationMigrationService} from "../../src/service/ConfigurationMigrationService";

describe("ConfigurationServiceTest", (): void => {

    let testee: ConfigurationService;
    let configurationMigrationService: SubstituteOf<ConfigurationMigrationService>;
    let extensionConfigurationMock: SubstituteOf<ExtensionConfiguration>;
    let chromeStorageServiceMock: SubstituteOf<ChromeStorageService>;

    beforeEach((): void => {
        container.reset();

        configurationMigrationService = Substitute.for<ConfigurationMigrationService>();
        container.register(ConfigurationMigrationService, {useValue: configurationMigrationService});

        extensionConfigurationMock = Substitute.for<ExtensionConfiguration>();
        container.register(ExtensionConfiguration, {useValue: extensionConfigurationMock});

        chromeStorageServiceMock = Substitute.for<ChromeStorageService>();
        container.register(ChromeStorageService, {useValue: chromeStorageServiceMock});

        testee = container.resolve(ConfigurationService);
    });

    test("testGetConfiguration", async (): Promise<void> => {
        const configuration: Configuration = {
            contextMenu: [
                {
                    id: Action.DOWNLOAD,
                    title: "download",
                    active: false
                },
                {
                    id: Action.SAVE_AS,
                    title: "saveAs",
                    active: false
                }
            ],
            downloader: []
        };
        chromeStorageServiceMock.load(Arg.any()).returns(Promise.resolve(configuration));

        const result = await testee.getConfiguration();

        chromeStorageServiceMock.received(1).load(Arg.any());
        expect(result).toEqual(configuration);
    });

    test("testSaveConfiguration", async (): Promise<void> => {
        const configuration: Configuration = {
            contextMenu: [
                {
                    id: Action.DOWNLOAD,
                    title: "download",
                    active: false
                },
                {
                    id: Action.SAVE_AS,
                    title: "saveAs",
                    active: false
                }
            ],
            downloader: []
        };

        await testee.saveConfiguration(configuration);

        chromeStorageServiceMock.received(1).save(configuration);
    });

    test("testAddConfigurationChangeListener", async (): Promise<void> => {

        testee.addConfigurationChangeListener(jest.fn());

        chromeStorageServiceMock.received(1).addOnChangeListener(Arg.any());
    });

});