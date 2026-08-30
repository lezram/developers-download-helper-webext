import {container} from "tsyringe";
import {BrowserStorageService} from "../../../src/service/browser/BrowserStorageService";
import * as browserMock from "../../test-support/BrowserMock";

describe("BrowserStorageServiceTest", (): void => {

    let testee: BrowserStorageService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserStorageService);
    });

    test("testSave", async (): Promise<void> => {
        await expect(testee.save({key: "value"})).resolves.toEqual({key: "value"});

        expect(browserMock.storage.sync.set).toHaveBeenCalledWith({key: "value"});
    });

    test("testSaveFailed", async (): Promise<void> => {
        const error = new Error("");
        browserMock.storage.sync.set.mockRejectedValue(error);

        await expect(testee.save({key: "value"})).rejects.toBe(error);
    });

    test("testLoad", async (): Promise<void> => {
        browserMock.storage.sync.get.mockResolvedValue({key: "value"});

        await expect(testee.load("key")).resolves.toEqual({key: "value"});

        expect(browserMock.storage.sync.get).toHaveBeenCalledWith("key");
    });

    test("testLoadFailed", async (): Promise<void> => {
        const error = new Error("");
        browserMock.storage.sync.get.mockRejectedValue(error);

        await expect(testee.load("key")).rejects.toBe(error);
    });

    test("testClearStorage", async (): Promise<void> => {
        await expect(testee.clearStorage()).resolves.toBeUndefined();

        expect(browserMock.storage.sync.clear).toHaveBeenCalledTimes(1);
    });

    test("testClearStorageFailed", async (): Promise<void> => {
        const error = new Error("");
        browserMock.storage.sync.clear.mockRejectedValue(error);

        await expect(testee.clearStorage()).rejects.toBe(error);
    });

    test("testAddOnChangeListener", async (): Promise<void> => {
        const onChange = jest.fn();

        testee.addOnChangeListener(onChange);

        expect(browserMock.storage.onChanged.addListener).toHaveBeenCalledTimes(1);

        const registeredListener = browserMock.storage.onChanged.addListener.mock.calls[0][0];
        await registeredListener({key: "value"}, "sync");

        expect(onChange).toHaveBeenCalledWith({key: "value"}, "sync");
    });

});
