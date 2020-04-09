import {singleton} from "tsyringe";
import {plainToClass} from "class-transformer";

@singleton()
export class ChromeStorageService {

    public load<T>(keys: string | string[] | T | null): Promise<T> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(keys, (item: T) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }

                resolve(item);
            });
        });
    }

    public save<T>(data: T): Promise<T> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(data, function () {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }

                resolve(data);
            });
        });
    }

    public clearStorage(): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.clear(function () {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                resolve();
            });
        });
    }

    public addOnChangeListener(onChange: (changes, namespace) => Promise<void>): void {
        chrome.storage.onChanged.addListener(async (changes, namespace) => {
            await onChange(changes, namespace);
        });
    }

}