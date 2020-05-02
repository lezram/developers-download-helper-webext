import {container} from "tsyringe";
import {DownloaderRegistry} from "../../../src/service/downloader/DownloaderRegistry";
import {Downloader, DOWNLOADER} from "../../../src/service/downloader/Downloader";
import {Mo} from "../../test-support/Mo";
import {SubstituteOf} from "@fluffy-spoon/substitute";
import {TestUtil} from "../../test-support/TestUtil";

describe("DownloaderRegistryTest", (): void => {
    const DOWNLOADER_1_ID = TestUtil.randomString();
    const DOWNLOADER_2_ID = TestUtil.randomString();

    function registerDownloaderMock(id: string): SubstituteOf<Downloader> {
        const downloaderMock = Mo.mock<Downloader>();
        downloaderMock.getMetadata().returns({
            id: id,
            name: "NAME_" + id,
            allowCustomUrls: true,
            configuration: {
                linkPatterns: [],
                permissions: []
            }
        });
        container.register(DOWNLOADER, {useValue: downloaderMock});
        return downloaderMock;
    }

    beforeEach((): void => {
        container.reset()
    });

    test("testDownloaderRegistryFailedNoDownloaders", async (): Promise<void> => {

        const initializeRegistry = (): void => {
            container.resolve(DownloaderRegistry);
        }

        expect(initializeRegistry).toThrowError();
    });

    test("testDownloaderRegistryFailedNoMetadata", async (): Promise<void> => {
        const downloaderMock = Mo.mock<Downloader>();
        downloaderMock.getMetadata().returns(null);
        container.register(DOWNLOADER, {useValue: downloaderMock});

        const initializeRegistry = (): void => {
            container.resolve(DownloaderRegistry);
        }

        expect(initializeRegistry).toThrowError();
    });

    test("testDownloaderRegistryFailedDuplicateId", async (): Promise<void> => {
        registerDownloaderMock(DOWNLOADER_1_ID);
        registerDownloaderMock(DOWNLOADER_1_ID);

        const initializeRegistry = (): void => {
            container.resolve(DownloaderRegistry);
        }

        expect(initializeRegistry).toThrowError();
    });

    test("testGetDownloader", async (): Promise<void> => {
        const downloader1Mock = registerDownloaderMock(DOWNLOADER_1_ID);
        registerDownloaderMock(DOWNLOADER_2_ID);
        const testee = container.resolve(DownloaderRegistry);

        let downloader = testee.getDownloader(DOWNLOADER_1_ID);

        expect(downloader).toEqual(downloader1Mock);
    });

    test("testGetDownloaderNotFound", async (): Promise<void> => {
        registerDownloaderMock(DOWNLOADER_1_ID);
        const testee = container.resolve(DownloaderRegistry);

        const getDownloader = (): void => {
            testee.getDownloader("");
        };

        expect(getDownloader).toThrowError();
    });

    test("testGetAllDownloadersMetadata", async (): Promise<void> => {
        registerDownloaderMock(DOWNLOADER_1_ID);
        registerDownloaderMock(DOWNLOADER_2_ID);
        const testee = container.resolve(DownloaderRegistry);

        let allDownloadersMetadata = testee.getAllDownloadersMetadata();

        expect(allDownloadersMetadata).toHaveLength(2);
        expect(allDownloadersMetadata[0].id).toBe(DOWNLOADER_1_ID);
        expect(allDownloadersMetadata[1].id).toBe(DOWNLOADER_2_ID);
    });

    test("testGetAllDownloadersMetadataIncompleteMetadata", async (): Promise<void> => {
        registerDownloaderMock("");
        registerDownloaderMock(DOWNLOADER_2_ID);
        const testee = container.resolve(DownloaderRegistry);

        let allDownloadersMetadata = testee.getAllDownloadersMetadata();

        expect(allDownloadersMetadata).toHaveLength(1);
        expect(allDownloadersMetadata[0].id).toBe(DOWNLOADER_2_ID);
    });

});