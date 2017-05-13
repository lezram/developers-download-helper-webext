import FileLoader from "./FileLoader";
import OnClickData = chrome.contextMenus.OnClickData;
import NotificationHelper from "./NotificationHelper";

export default class FileDownloader {

    public static saveAs(info: OnClickData, tab: chrome.tabs.Tab){
        FileDownloader.download(info, tab, true);
    }

    public static download(info: OnClickData, tab: chrome.tabs.Tab, showSaveAs=false){
        if (!info || !info.linkUrl) {
            return;
        }

        let notificationId: string = NotificationHelper.create("Progress download", "", 2, true);

        let fileDownloader: FileLoader;
        try {
            fileDownloader = new FileLoader(info.linkUrl);
        }
        catch (e){
            chrome.notifications.clear(notificationId);
            NotificationHelper.create("URL not supported", ""+info.linkUrl, 7);
            return;
        }

        fileDownloader.getDownloadURL().then(function(url: string) {
            let filename = fileDownloader.getFilename();
            filename = filename.replace(/^\./g,"_.");

            chrome.downloads.download({
                filename: filename,
                url: url,
                saveAs: showSaveAs
            }, function () {
                chrome.notifications.clear(notificationId);
                if(chrome.runtime.lastError){
                    NotificationHelper.create("Download failed", ""+chrome.runtime.lastError.message, 7);
                }
            });
        }, function(){
            NotificationHelper.create("Download failed", "", 7);
        });
    }
}