import {Downloader} from "../Downloader";
import {FileType, FileWrapper} from "../../../model/FileWrapper";
import {ActionData} from "../../../model/ActionData";
import {singleton} from "tsyringe";
import GithubURL from "./GithubURL";
import {FileType as GitHubFileType} from "./FileType";
import {DownloaderMetadata} from "../../../model/DownloaderMetadata";
import {ResourceNotAccessibleException} from "../../../exception/ResourceNotAccessibleException";

@singleton()
export class GitHubDownloader implements Downloader {
    public static readonly ID = "gh";

    public async getFile(data: ActionData): Promise<FileWrapper> {
        if (!data || !data.url) {
            return;
        }

        const originalUrl = data.url.toString();

        let githubURL: GithubURL;
        try {
            githubURL = new GithubURL(originalUrl);
        } catch (e) {
            throw new Error("invalid url");
        }


        let url;
        try {
            url = await githubURL.getDownloadUrl();
        } catch (error) {
            throw new ResourceNotAccessibleException(`Request resource failed: ${githubURL}`, error);
        }

        let filename = null;
        let type: FileType = FileType.URL;

        if (githubURL.fileType !== GitHubFileType.ZIPBALL && githubURL.fileType !== GitHubFileType.TREE) {
            try {
                const blobFile = await fetch(<string>url, {credentials: 'include'});
                const theFile = await blobFile.blob();
                type = FileType.RAW;
                url = theFile;
            } catch (error) {
                throw new ResourceNotAccessibleException(`Request resource failed: ${githubURL}`, error);
            }

            filename = githubURL.filePath.split("/").pop().replace(/^[.]+/g, "");
        } else if (githubURL.fileType === GitHubFileType.TREE) {
            filename = (githubURL.filePath.split("/").pop()) + ".zip";
        }

        if (githubURL.fileType == GitHubFileType.ZIPBALL ||
            githubURL.fileType == GitHubFileType.TARBALL ||
            githubURL.fileType == GitHubFileType.TREE) {
            type = FileType.URL;
        }

        return {
            type: type,
            name: filename,
            content: url
        }
    }

    public getMetadata(): DownloaderMetadata {
        return {
            id: GitHubDownloader.ID,
            name: "GitHub",
            configuration: {
                linkPatterns: ["https://github.com/*/*"],
                permissions: [
                    /* set in manifest.json! */
                    "https://*.github.com/*",
                    "https://*.githubusercontent.com/*",
                ]
            },
            allowCustomUrls: true,
        };
    }
}
