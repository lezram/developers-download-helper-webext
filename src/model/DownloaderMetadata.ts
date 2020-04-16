import {DownloaderConfiguration} from "./Configuration";

export class DownloaderMetadata {
    id: string;
    name: string;
    configuration: DownloaderConfiguration;
    allowCustomUrls: boolean;
}