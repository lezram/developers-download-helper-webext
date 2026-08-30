import { singleton } from "tsyringe";
import * as browser from "webextension-polyfill";

@singleton()
export class BrowserStorageService {

    public async load<T>(keys: string | string[] | Record<string, any> | null): Promise<T> {
        return <T>await browser.storage.sync.get(keys);
    }

    public async save<T>(data: T): Promise<T> {
        await browser.storage.sync.set(<Record<string, any>>data)
        return data;
    }

    public async clearStorage(): Promise<void> {
        return browser.storage.sync.clear();
    }

    public addOnChangeListener(onChange: (changes, namespace) => Promise<void>): void {
        browser.storage.onChanged.addListener(async (changes, namespace) => {
            await onChange(changes, namespace);
        });
    }

}
