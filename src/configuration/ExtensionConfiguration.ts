import {Configuration} from "../model/Configuration";
import {DownloaderRegistry} from "../service/downloader/DownloaderRegistry";
import {inject, injectable} from "tsyringe";
import {Action} from "../model/Action";

@injectable()
export class ExtensionConfiguration {

    constructor(@inject(DownloaderRegistry) private downloaderRegistry) {
    }

    public getDefaultConfiguration(): Configuration {
        return {
            downloader: this.downloaderRegistry.getDownloaderConfiguration(),
            contextMenu: [
                {
                    id: Action.SAVE_AS,
                    title: "Save as...",
                    active: true
                },
                {
                    id: Action.DOWNLOAD,
                    title: "Download",
                    active: false
                },
            ]
        }
    }
}