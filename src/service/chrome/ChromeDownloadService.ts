import {singleton} from "tsyringe";
import {FileType, FileWrapper} from "../../model/FileWrapper";

@singleton()
export class ChromeDownloadService {

    public downloadFile(file: FileWrapper, askBeforeSave = false): Promise<void> {

        let url;
        if (file.type === FileType.URL) {
            url = file.content;
        } else {
            const blob = new Blob([file.content], {type: "application/octet-stream"});
            url = URL.createObjectURL(blob);
        }

        return new Promise((resolve, reject) => {
            chrome.downloads.download({
                filename: file.name,
                url: url,
                saveAs: askBeforeSave,
            }, function () {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                    reject()
                }

                resolve();
            });
        });
    }
}