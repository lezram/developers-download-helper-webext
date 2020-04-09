import {DOWNLOADER, Downloader} from "./Downloader";
import {injectAll, registry, singleton} from "tsyringe";
import {GitLabDownloader} from "./gitlab/GitLabDownloader";
import {GitHubDownloader} from "./github/GitHubDownloader";
import {DownloaderMetadata} from "../../model/Configuration";

@singleton()
@registry([
    {token: DOWNLOADER, useToken: GitHubDownloader},
    {token: DOWNLOADER, useToken: GitLabDownloader},
    // Add new downloader classes here
])
export class DownloaderRegistry {
    private downloaderByIdentifier: { [key: string]: Downloader } = {};

    constructor(@injectAll(DOWNLOADER) private downloaderList: Downloader[]) {
        for (const downloader of downloaderList) {
            const metadata = downloader.getMetadata();

            if (!metadata || this.downloaderByIdentifier.hasOwnProperty(metadata.id)) {
                throw new Error("Invalid downloader configuration" + metadata);
            }

            this.downloaderByIdentifier[metadata.id] = downloader;
        }
    }

    public getDownloader(id: string): Downloader {
        if (this.downloaderByIdentifier.hasOwnProperty(id)) {
            return this.downloaderByIdentifier[id];
        } else {
            throw new Error("test");
        }
    }

    public getDownloaderConfiguration(): DownloaderMetadata[] {
        const downloaderConfiguration: DownloaderMetadata[] = [];

        for (const downloaderId in this.downloaderByIdentifier) {
            const downloader = this.downloaderByIdentifier[downloaderId];
            const metadata = downloader.getMetadata();
            downloaderConfiguration.push(metadata);
        }

        return downloaderConfiguration;
    }

}