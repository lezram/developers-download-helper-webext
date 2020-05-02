import {container} from "tsyringe";
import {ChromeStorageService} from "../../../src/service/chrome/ChromeStorageService";
import {TestUtil} from "../../test-support/TestUtil";

describe("ChromeStorageServiceTest", (): void => {

    let testee: ChromeStorageService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(ChromeStorageService);
    });

    test("testSave", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();

        await testee.save("");

        expect(chrome.storage.sync.set).toBeCalledTimes(1);
    });

    test("testSaveFailed", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();
        chrome.runtime.lastError = true;

        const save = async (): Promise<void> => {
            await testee.save("");
        };

        await expect(save()).rejects.toBeTruthy();
        expect(chrome.storage.sync.set).toBeCalledTimes(1);
    });

    test("testLoad", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();

        await testee.load("");

        expect(chrome.storage.sync.get).toBeCalledTimes(1);
    });

    test("testLoadFailed", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();
        chrome.runtime.lastError = true;

        const load = async (): Promise<void> => {
            await testee.load("");
        };

        await expect(load()).rejects.toBeTruthy();
        expect(chrome.storage.sync.get).toBeCalledTimes(1);
    });

    test("testClearStorage", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();

        await testee.clearStorage();

        expect(chrome.storage.sync.clear).toBeCalledTimes(1);
    });

    test("testClearStorageFailed", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();
        chrome.runtime.lastError = true;

        const clearStorage = async (): Promise<void> => {
            await testee.clearStorage();
        };

        await expect(clearStorage()).rejects.toBeTruthy();
        expect(chrome.storage.sync.clear).toBeCalledTimes(1);
    });

    test("testAddOnChangeListener", async (): Promise<void> => {
        const chrome = TestUtil.initializeChromeContext();

        await testee.addOnChangeListener(async (changes, namespace): Promise<void> => {
        });

        expect(chrome.storage.onChanged.addListener).toBeCalledTimes(1);
    });

});