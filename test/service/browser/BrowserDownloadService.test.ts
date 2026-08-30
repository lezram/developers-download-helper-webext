import {container} from "tsyringe";
import {BrowserDownloadService} from "../../../src/service/browser/BrowserDownloadService";
import {FileType} from "../../../src/model/FileWrapper";
import {TestUtil} from "../../test-support/TestUtil";
import * as browserMock from "../../test-support/BrowserMock";

describe("BrowserDownloadServiceTest", (): void => {

    let testee: BrowserDownloadService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserDownloadService);
    });

    afterEach((): void => {
        TestUtil.restoreJsBrowserFunctions();
    });

    test("testDownloadFile", async (): Promise<void> => {
        TestUtil.mockJsBrowserFunctions();
        browserMock.downloads.download.mockResolvedValue(1001);

        const result = testee.downloadFile({
            type: FileType.RAW,
            name: "test.txt",
            content: "abcdefg"
        })

        await expect(result).resolves.toBe(1001);
    });

    test("testDownloadFileUrlFile", async (): Promise<void> => {
        TestUtil.mockJsBrowserFunctions();
        browserMock.downloads.download.mockResolvedValue(1001);

        const result = testee.downloadFile({
            type: FileType.URL,
            name: "test.txt",
            content: "abcdefg"
        })

        await expect(result).resolves.toBe(1001);
    });

    test("testDownloadFileWithoutObjectUrlSupport", async (): Promise<void> => {
        TestUtil.simulateServiceWorkerWithoutObjectUrl();
        browserMock.downloads.download.mockResolvedValue(1001);

        const result = testee.downloadFile({
            type: FileType.RAW,
            name: "test.txt",
            content: "abcdefg"
        });

        await expect(result).resolves.toBe(1001);
        expect(browserMock.downloads.download).toHaveBeenCalledWith({
            filename: "test.txt",
            url: "data:application/octet-stream;base64," + Buffer.from("abcdefg").toString("base64"),
            saveAs: false
        });
    });

    test("testDownloadFileFailed", async (): Promise<void> => {
        TestUtil.mockJsBrowserFunctions();

        let error = new Error("failed");
        browserMock.downloads.download.mockRejectedValue(error);

        const result = testee.downloadFile({
            type: FileType.RAW,
            name: "test.txt",
            content: "abcdefg"
        });

        await expect(result).rejects.toBe(error);
    });

});
