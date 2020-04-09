import {Action} from "./Action";
import {Expose, Transform, Type} from "class-transformer";

export class Configuration {
    @Expose()
    @Type(() => DownloaderMetadata)
    downloader: DownloaderMetadata[] = [];

    @Expose()
    @Type(() => ContextMenuItemConfiguration)
    @Transform((value: ContextMenuItemConfiguration[]) => {
        if (Array.isArray(value)) {
            const result = [];

            for (const val of value) {
                if (val.id) {
                    result.push(val);
                }
            }

            return result;
        } else {
            return [];
        }
    }, {toClassOnly: true})
    contextMenu: ContextMenuItemConfiguration[] = [];
}

export class DownloaderMetadata {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    urlPatterns: string[];
}

export class ContextMenuItemConfiguration {
    @Expose()
    id: Action;

    @Expose()
    title: string;

    @Expose()
    active: boolean;
}