import {singleton} from "tsyringe";

@singleton()
export class ChromePermissionService {

    public requestUrlPermission(urls: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            chrome.permissions.request({
                origins: urls
            }, (granted: boolean) => {
                if (chrome.runtime.lastError) {
                    resolve(false);
                }
                resolve(granted);
            });
        });
    }


    public hasUrlPermissions(urls: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            chrome.permissions.request({
                origins: urls
            }, (hasPermissions: boolean) => {
                if (chrome.runtime.lastError) {
                    resolve(false);
                }
                resolve(hasPermissions);
            });
        });
    }


}