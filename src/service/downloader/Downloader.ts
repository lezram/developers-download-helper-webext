import {DownloaderMetadata} from "../../model/Configuration";
import {FileWrapper} from "../../model/FileWrapper";
import {ActionData} from "../../model/ActionData";

export const DOWNLOADER = "Downloader";

export interface Downloader {
    getFile(data: ActionData): Promise<FileWrapper>;

    getMetadata(): DownloaderMetadata;
}