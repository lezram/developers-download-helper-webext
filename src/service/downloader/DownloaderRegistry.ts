import {DOWNLOADER, Downloader} from "./Downloader";
import {injectAll, registry, singleton} from "tsyringe";
import {GitLabDownloader} from "./gitlab/GitLabDownloader";
import {GitHubDownloader} from "./github/GitHubDownloader";
import {DownloaderMetadata} from "../../model/DownloaderMetadata";

@singleton()
@registry([
    {token: DOWNLOADER, useToken: GitHubDownloader},
    {token: DOWNLOADER, useToken: GitLabDownloader},
    // Add new downloader classes here
])
export class DownloaderRegistry {
    private downloaders: Map<string, Downloader> = new Map();

    constructor(@injectAll(DOWNLOADER) private downloaderList: Downloader[]) {
        for (const downloader of downloaderList) {
            const metadata = downloader.getMetadata();

            if (!metadata || this.downloaders.has(metadata.id)) {
                throw new Error("Invalid downloader configuration" + metadata);
            }

            this.downloaders.set(metadata.id, downloader);
        }
    }

    public getDownloader(downloaderId: string): Downloader {
        if (this.downloaders.has(downloaderId)) {
            return this.downloaders.get(downloaderId);
        } else {
            throw new Error("No downloader found for id " + downloaderId);
        }
    }

    public getAllDownloadersMetadata(): DownloaderMetadata[] {
        const allMetadata = [];

        for (const downloader of this.downloaders.values()) {
            let metadata = downloader.getMetadata();

            if (metadata && metadata.id) {
                allMetadata.push(metadata);
            }
        }

        return allMetadata;
    }

}