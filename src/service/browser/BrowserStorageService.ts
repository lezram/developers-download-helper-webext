import {singleton} from "tsyringe";
import { browser } from "webextension-polyfill-ts";

@singleton()
export class BrowserStorageService {

    public async load<T>(keys: string | string[] | T | null): Promise<T> {
        return <T> await browser.storage.sync.get(keys);
    }

    public async save<T>(data: T): Promise<T> {
        await browser.storage.sync.set(data)
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
