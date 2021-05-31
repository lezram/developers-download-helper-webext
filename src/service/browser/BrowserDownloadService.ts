import {singleton} from "tsyringe";
import {FileType, FileWrapper} from "../../model/FileWrapper";
import {browser} from "webextension-polyfill-ts";
import {Util} from "../../util/Util";

@singleton()
export class BrowserDownloadService {

    public async downloadFile(file: FileWrapper, askBeforeSave = false): Promise<number> {

        let url;
        if (file.type === FileType.URL) {
            url = file.content;

            if (this.isDataUri(url)) {
                const blob = Util.convertDataUriToBlob(url);
                url = URL.createObjectURL(blob);
            }
        } else {
            const blob = new Blob([file.content], {type: "application/octet-stream"});
            url = URL.createObjectURL(blob);
        }

        const filename = file.name.replace(/^[.]+/, "");

        return await browser.downloads.download({
            filename: filename,
            url: url,
            saveAs: askBeforeSave,
        });
    }


    private isDataUri(url) {
        return url //
            && url.startsWith("data:") //
            && url.split(',').length === 2;
    }
}
