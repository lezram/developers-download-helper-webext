import {container} from "tsyringe";
import {BrowserDownloadService} from "../../../src/service/browser/BrowserDownloadService";
import {FileType} from "../../../src/model/FileWrapper";
import {TestUtil} from "../../test-support/TestUtil";

describe("BrowserDownloadServiceTest", (): void => {

    let testee: BrowserDownloadService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserDownloadService);
    });

    test("testDownloadFile", async (): Promise<void> => {
        TestUtil.mockJsBrowserFunctions();
        mockBrowser.downloads.download.expect.andResolve(1001).times(1);

        const result = testee.downloadFile({
            type: FileType.RAW,
            name: "test.txt",
            content: "abcdefg"
        })

        await expect(result).resolves.toBe(1001);
    });

    test("testDownloadFileUrlFile", async (): Promise<void> => {
        TestUtil.mockJsBrowserFunctions();
        mockBrowser.downloads.download.expect.andResolve(1001).times(1);

        const result = testee.downloadFile({
            type: FileType.URL,
            name: "test.txt",
            content: "abcdefg"
        })

        await expect(result).resolves.toBe(1001);
    });

    test("testDownloadFileFailed", async (): Promise<void> => {
        TestUtil.mockJsBrowserFunctions();

        let error = new Error("failed");
        mockBrowser.downloads.download.expect.andReject(error).times(1);

        const result = testee.downloadFile({
            type: FileType.RAW,
            name: "test.txt",
            content: "abcdefg"
        });

        await expect(result).rejects.toBe(error);
    });

});
