import {singleton} from "tsyringe";
import {browser} from "webextension-polyfill-ts";

@singleton()
export class BrowserPermissionService {

    public requestUrlPermission(urls: string[]): Promise<boolean> {
        return browser.permissions.request({
            origins: urls
        });
    }

    public async getAllUrlPermissions(): Promise<string[]> {
        let anyPermissions = await browser.permissions.getAll();
        return anyPermissions.origins;
    }

    public async removeUrlPermissions(urls: string[]): Promise<boolean> {
        return browser.permissions.remove({origins: urls});
    }
}
