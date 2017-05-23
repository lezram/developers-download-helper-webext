import OnClickData = chrome.contextMenus.OnClickData;
import NotificationHelper from "./NotificationHelper";
import GithubURL from "./GithubURL";
import {FileType} from "./FileType";

export default class FileDownloader {

    public static saveAs(info: OnClickData, tab: chrome.tabs.Tab) {
        FileDownloader.download(info, tab, true);
    }

    public static download(info: OnClickData, tab: chrome.tabs.Tab, showSaveAs = false) {
        if (!info || !info.linkUrl) {
            return;
        }

        let notificationId: string = NotificationHelper.create("Progress download", "", 2, true);

        let githubURL: GithubURL;
        try {
            githubURL = new GithubURL(info.linkUrl);
        }
        catch (e) {
            chrome.notifications.clear(notificationId);
            NotificationHelper.create("URL not supported", "" + info.linkUrl, 7);
            return;
        }

        githubURL.getDownloadUrl().then(function (url: string) {
            let filename = null;

            if(githubURL.fileType !== FileType.ZIPBALL && githubURL.fileType !== FileType.TREE){
                filename = githubURL.filePath.split("/").pop().replace(/^[.]+/g,"");
            }
            else if(githubURL.fileType === FileType.TREE){
                filename = (githubURL.filePath.split("/").pop())+".zip";
            }

            chrome.downloads.download({
                filename: filename,
                url: url,
                saveAs: showSaveAs
            }, function () {
                chrome.notifications.clear(notificationId);
                if (chrome.runtime.lastError) {
                    NotificationHelper.create("Download failed", "" + chrome.runtime.lastError.message, 7);
                }
            });

        }, function () {
            console.log(arguments);
            NotificationHelper.create("Download failed", "", 7);
        });
    }
}