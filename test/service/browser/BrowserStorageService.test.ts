import {container} from "tsyringe";
import {BrowserStorageService} from "../../../src/service/browser/BrowserStorageService";

describe("BrowserStorageServiceTest", (): void => {

    let testee: BrowserStorageService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserStorageService);
    });

    test("testSave", async (): Promise<void> => {
        mockBrowser.storage.sync.set.expect.times(1);

        await expect(testee.save("")).resolves;
    });

    test("testSaveFailed", async (): Promise<void> => {
        const error = new Error("");
        mockBrowser.storage.sync.set.expect.andReject(error).times(1);

        await expect(testee.save("")).rejects.toBe(error);
    });

    test("testLoad", async (): Promise<void> => {
        mockBrowser.storage.sync.get.expect.times(1);

        await expect(testee.load("")).resolves;
    });

    test("testLoadFailed", async (): Promise<void> => {
        const error = new Error("");
        mockBrowser.storage.sync.get.expect.andReject(error).times(1);

        await expect(testee.load("")).rejects.toBe(error);
    });

    test("testClearStorage", async (): Promise<void> => {
        mockBrowser.storage.sync.clear.expect.times(1);

        await expect(testee.clearStorage()).resolves;
    });

    test("testClearStorageFailed", async (): Promise<void> => {
        const error = new Error("");
        mockBrowser.storage.sync.clear.expect.andReject(error).times(1);

        await expect(testee.clearStorage()).rejects.toBe(error);
    });

    test("testAddOnChangeListener", async (): Promise<void> => {
        mockBrowser.storage.onChanged.addListener.expect.times(1);

        const result = testee.addOnChangeListener(async (changes, namespace): Promise<void> => {
        });

        await expect(result).resolves;
    });

});
