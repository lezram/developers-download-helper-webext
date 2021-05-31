import {container} from "tsyringe";
import {Mo} from "../../test-support/Mo";
import {JSDOM} from 'jsdom';
import {Arg, SubstituteOf} from "@fluffy-spoon/substitute";
import {TestUtil} from "../../test-support/TestUtil";
import {HtmlOptionsService} from "../../../src/service/option/HtmlOptionsService";
import {BrowserPermissionService} from "../../../src/service/browser/BrowserPermissionService";
import {ConfigurationService} from "../../../src/service/ConfigurationService";
import {ExtensionConfiguration} from "../../../src/configuration/ExtensionConfiguration";
import {DownloaderRegistry} from "../../../src/service/downloader/DownloaderRegistry";
import {Configuration, ContextMenuItemConfiguration, DownloaderConfiguration} from "../../../src/model/Configuration";
import {Action} from "../../../src/model/Action";

describe("HtmlOptionsServiceTest", (): void => {
    const DONWLOADER_ID = TestUtil.randomString();
    const DEFAULT_URL = "https://test.localhost/" + TestUtil.randomString() + "/*";
    const DOCUMENT: HTMLDocument = (new JSDOM(`...`)).window.document;

    let testee: HtmlOptionsService;
    let browserPermissionServiceMock: SubstituteOf<BrowserPermissionService>;
    let configurationServiceMock: SubstituteOf<ConfigurationService>;
    let extensionConfigurationMock: SubstituteOf<ExtensionConfiguration>;
    let downloaderRegistryMock: SubstituteOf<DownloaderRegistry>;

    function mockSimpleConfiguration(): void {
        extensionConfigurationMock.getActionItems().returns([
            {
                id: Action.DOWNLOAD,
                title: "Download",
                defaultActive: false
            }
        ]);
        downloaderRegistryMock.getAllDownloadersMetadata().returns([
            {
                id: DONWLOADER_ID,
                name: "test",
                allowCustomUrls: true,
                configuration: {
                    linkPatterns: [DEFAULT_URL],
                    permissions: [DEFAULT_URL]
                }
            }
        ]);
        configurationServiceMock.getConfiguration().resolves(new Configuration());
    }

    beforeEach((): void => {
        container.reset();

        browserPermissionServiceMock = Mo.injectMock(BrowserPermissionService);
        configurationServiceMock = Mo.injectMock(ConfigurationService);
        extensionConfigurationMock = Mo.injectMock(ExtensionConfiguration);
        downloaderRegistryMock = Mo.injectMock(DownloaderRegistry);

        testee = container.resolve(HtmlOptionsService);
    });

    test("testShowOptionsHtml", async (): Promise<void> => {
        extensionConfigurationMock.getActionItems().returns([
            {
                id: Action.DOWNLOAD,
                title: "Download",
                defaultActive: false
            },
            {
                id: Action.SAVE_AS,
                title: "Save As",
                defaultActive: true
            }
        ]);
        downloaderRegistryMock.getAllDownloadersMetadata().returns([
            {
                id: DONWLOADER_ID,
                name: "test",
                allowCustomUrls: true,
                configuration: {
                    linkPatterns: [DEFAULT_URL],
                    permissions: [DEFAULT_URL]
                }
            },
            {
                id: "test1",
                name: "test",
                allowCustomUrls: true,
                configuration: {
                    linkPatterns: [DEFAULT_URL],
                    permissions: [DEFAULT_URL],
                    disabled: true
                }
            }
        ]);

        const downloader: Map<string, DownloaderConfiguration> = new Map<string, DownloaderConfiguration>();
        downloader.set(DONWLOADER_ID, {
            disabled: false,
            permissions: [],
            linkPatterns: []
        })

        const contextMenu: Map<Action, ContextMenuItemConfiguration> = new Map<Action, ContextMenuItemConfiguration>();
        contextMenu.set(Action.DOWNLOAD, {
            active: true
        })

        configurationServiceMock.getConfiguration().resolves({
            contextMenu: contextMenu,
            downloader: downloader
        });

        const element = DOCUMENT.createElement("div");

        await testee.showOptionsHtml(element);

        expect(element).not.toBeNull();
    });

    test("testSaveUpdatedOptions", async (): Promise<void> => {
        mockSimpleConfiguration();

        const element = DOCUMENT.createElement("div");
        element.innerHTML = `
            <input id="service_${DONWLOADER_ID}_url_pattern" value="https://test.localhost/*">
            <input type="checkbox" id="menu_${Action.DOWNLOAD}_active" checked="checked">
        `

        await testee.saveUpdatedOptions(element);

        const configuration = new Configuration();
        configuration.contextMenu.set(Action.DOWNLOAD, {active: true});
        configuration.downloader.set(DONWLOADER_ID, {
            linkPatterns: ["https://test.localhost/*"],
            permissions: ["https://test.localhost/*"]
        });

        configurationServiceMock.received(1).saveConfiguration(configuration);
    });

    test("testSaveUpdatedOptionsNoOptions", async (): Promise<void> => {
        mockSimpleConfiguration();

        const element = DOCUMENT.createElement("div");
        element.innerHTML = `
            <input id="service_${DONWLOADER_ID}_url_pattern" value="">
            <input type="checkbox" id="menu_${Action.DOWNLOAD}_active" checked="checked">
        `

        await testee.saveUpdatedOptions(element);

        const configuration = new Configuration();
        configuration.contextMenu.set(Action.DOWNLOAD, {active: true});

        configurationServiceMock.received(1).saveConfiguration(configuration);
    });

    test("testSaveUpdatedOptionsInvalidUrl", async (): Promise<void> => {
        mockSimpleConfiguration();

        const element = DOCUMENT.createElement("div");
        element.innerHTML = `
            <input id="service_${DONWLOADER_ID}_url_pattern" value="https://test.localhost/">
            <input type="checkbox" id="menu_${Action.DOWNLOAD}_active" checked="checked">
        `

        const saveOptions = async (): Promise<void> => {
            await testee.saveUpdatedOptions(element);

        }

        await expect(saveOptions()).rejects.toThrowError();
    });
});
