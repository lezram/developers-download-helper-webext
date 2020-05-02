import {container} from "tsyringe";
import {Arg, SubstituteOf} from "@fluffy-spoon/substitute";
import {ConfigurationService} from "../../src/service/ConfigurationService";
import {Configuration, ContextMenuItemConfiguration, DownloaderConfiguration} from "../../src/model/Configuration";
import {ExtensionConfiguration} from "../../src/configuration/ExtensionConfiguration";
import {ChromeStorageService} from "../../src/service/chrome/ChromeStorageService";
import {Action} from "../../src/model/Action";
import {ConfigurationMigrationService} from "../../src/service/ConfigurationMigrationService";
import {Mo} from "../test-support/Mo";
import {TestUtil} from "../test-support/TestUtil";

describe("ConfigurationServiceTest", (): void => {
    const DOWNLOADER_ID = TestUtil.randomString();

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

    test("testGetConfigurationWithNull", async (): Promise<void> => {
        const configuration: Configuration = {
            contextMenu: null,
            downloader: null
        };
        chromeStorageServiceMock.load(Arg.any()).returns(Promise.resolve(configuration));

        const result = await testee.getConfiguration();

        chromeStorageServiceMock.received(1).load(Arg.any());
        expect(result).toEqual({
            contextMenu: new Map(),
            downloader: new Map()
        });
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
        const callbackMock = jest.fn();
        let callbackPromise = Promise.resolve();
        chromeStorageServiceMock.load(Arg.any()).resolves({
            contextMenu: new Map(),
            downloader: new Map()
        });

        chromeStorageServiceMock.addOnChangeListener(Arg.any()).mimicks((onChange: (changes, namespace) => Promise<void>) => {
            callbackPromise = new Promise(async (resolve, reject) => {
                await onChange(null, null);
                resolve();
            });
        });

        testee.addConfigurationChangeListener(callbackMock);

        await Promise.all([callbackPromise]);

        expect(callbackMock).toBeCalledTimes(1);
        chromeStorageServiceMock.received(1).addOnChangeListener(Arg.any());
        chromeStorageServiceMock.received(1).load(Arg.any());
    });

    test("testGetDownloaderCustomConfiguration", async (): Promise<void> => {
        const downloaderConfiguration = new Map<string, DownloaderConfiguration>();
        downloaderConfiguration.set(DOWNLOADER_ID, {
            linkPatterns: [],
            permissions: [],
            disabled: true
        });

        const configuration: Configuration = {
            contextMenu: new Map(),
            downloader: downloaderConfiguration
        };
        chromeStorageServiceMock.load(Arg.any()).resolves(configuration);

        const config = await testee.getDownloaderCustomConfiguration(DOWNLOADER_ID);

        expect(config).toEqual({
            linkPatterns: [],
            permissions: [],
            disabled: true
        });
    });

    test("testGetDownloaderCustomConfigurationNotFound", async (): Promise<void> => {
        const configuration: Configuration = {
            contextMenu: new Map(),
            downloader: new Map()
        };
        chromeStorageServiceMock.load(Arg.any()).resolves(configuration);

        const config = await testee.getDownloaderCustomConfiguration(DOWNLOADER_ID);

        expect(config).toBeNull();
    });

    test("testGetActiveActionItems", async (): Promise<void> => {
        const contextMenu = new Map<Action, ContextMenuItemConfiguration>();
        contextMenu.set(Action.DOWNLOAD, {active: true});
        extensionConfigurationMock.getActionItems().returns([
            {
                id: Action.DOWNLOAD,
                title: "Download",
                defaultActive: false
            }
        ]);

        const configuration: Configuration = {
            contextMenu: contextMenu,
            downloader: new Map()
        };
        chromeStorageServiceMock.load(Arg.any()).resolves(configuration);

        const config = await testee.getActiveActionItems();

        expect(config).toEqual([{
            id: Action.DOWNLOAD,
            title: "Download",
            defaultActive: false
        }]);
    });

});