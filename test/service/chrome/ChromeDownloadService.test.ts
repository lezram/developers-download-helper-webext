import {container} from "tsyringe";
import {ChromeDownloadService} from "../../../src/service/chrome/ChromeDownloadService";
import {FileType} from "../../../src/model/FileWrapper";
import {TestUtil} from "../../test-support/TestUtil";

describe("ChromeDownloadServiceTest", (): void => {

    let testee: ChromeDownloadService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(ChromeDownloadService);
    });

    test("testDownloadFile", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();

        await testee.downloadFile({
            type: FileType.RAW,
            name: "test.txt",
            content: "abcdefg"
        })

        expect(chrome.downloads.download).toBeCalledTimes(1);
    });

    test("testDownloadFileUrlFile", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();

        await testee.downloadFile({
            type: FileType.URL,
            name: "test.txt",
            content: "abcdefg"
        })

        expect(chrome.downloads.download).toBeCalledTimes(1);
    });

    test("testDownloadFileFailed", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();
        chrome.runtime.lastError = true;

        const downloadFile = async (): Promise<void> => {
            await testee.downloadFile({
                type: FileType.RAW,
                name: "test.txt",
                content: "abcdefg"
            });
        }

        await expect(downloadFile()).rejects.toBeUndefined();
        expect(chrome.downloads.download).toBeCalledTimes(1);
    });

});