import {container} from "tsyringe";
import {ConfigurationMigrationService} from "../../src/service/ConfigurationMigrationService";
import {Mo} from "../test-support/Mo";
import {ChromeStorageService} from "../../src/service/chrome/ChromeStorageService";
import {DownloaderRegistry} from "../../src/service/downloader/DownloaderRegistry";
import {Arg, SubstituteOf} from "@fluffy-spoon/substitute";
import {Downloader} from "../../src/service/downloader/Downloader";
import {TestUtil} from "../test-support/TestUtil";

describe("ConfigurationMigrationServiceTest", (): void => {

    const DEFAULT_URL = "https://test.localhost/" + TestUtil.randomString() + "/*";
    const URL = "https://test1.localhost/" + TestUtil.randomString() + "/*";

    let testee: ConfigurationMigrationService;
    let chromeStorageServiceMock: SubstituteOf<ChromeStorageService>;
    let downloaderRegistryMock: SubstituteOf<DownloaderRegistry>;

    beforeEach((): void => {
        container.reset();

        chromeStorageServiceMock = Mo.injectMock(ChromeStorageService);
        downloaderRegistryMock = Mo.injectMock(DownloaderRegistry);

        testee = container.resolve(ConfigurationMigrationService);
    });

    test("testMigrateConfigurationIfNeeded", async (): Promise<void> => {
        const downloaderMock = Mo.mock<Downloader>();
        downloaderMock.getMetadata().returns({
            id: "test",
            name: "test",
            allowCustomUrls: true,
            configuration: {
                linkPatterns: [DEFAULT_URL],
                permissions: [DEFAULT_URL]
            }
        });
        downloaderRegistryMock.getDownloader(Arg.any()).returns(downloaderMock);
        chromeStorageServiceMock.load(Arg.any()).resolves({
            urls: [URL, DEFAULT_URL],
            gitlaburls: [URL],
            contextMenu: {
                saveas: true,
                download: true
            }
        });

        const migrationNeeded = await testee.migrateConfigurationIfNeeded();

        expect(migrationNeeded).toBeTruthy();

        chromeStorageServiceMock.received(1).clearStorage();
        chromeStorageServiceMock.received(1).save(Arg.any());
    });

    test("testMigrateConfigurationIfNeededNoMigration", async (): Promise<void> => {
        chromeStorageServiceMock.load(Arg.any()).resolves(null);

        const migrationNeeded = await testee.migrateConfigurationIfNeeded();

        expect(migrationNeeded).toBeFalsy();
    });

});