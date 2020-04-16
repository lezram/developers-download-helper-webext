import {FileWrapper} from "../../model/FileWrapper";
import {ActionData} from "../../model/ActionData";
import {DownloaderMetadata} from "../../model/DownloaderMetadata";

export const DOWNLOADER = "Downloader";

export interface Downloader {
    getFile(data: ActionData): Promise<FileWrapper>;

    getMetadata(): DownloaderMetadata;
}