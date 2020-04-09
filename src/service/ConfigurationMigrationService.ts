import {inject, singleton} from "tsyringe";
import {ChromeStorageService} from "./chrome/ChromeStorageService";
import {Configuration} from "../model/Configuration";
import {DeprecatedConfiguration} from "../model/DeprecatedConfiguration";
import {plainToClass} from "class-transformer";
import {GitLabDownloader} from "./downloader/gitlab/GitLabDownloader";
import {GitHubDownloader} from "./downloader/github/GitHubDownloader";
import {Action} from "../model/Action";
import {Util} from "../util/Util";

@singleton()
export class ConfigurationMigrationService {

    constructor(@inject(ChromeStorageService) private chromeStorageService: ChromeStorageService) {
    }

    public async migrateConfigurationIfNeeded(defaultConfiguration: Configuration): Promise<void> {
        const configuration = Object.assign({}, defaultConfiguration);

        const deprecatedConfiguration = await this.chromeStorageService.load<DeprecatedConfiguration>([
            "urls", "gitlaburls", "contextMenu"
        ]);

        const deprecatedConfig = plainToClass(DeprecatedConfiguration, deprecatedConfiguration, {
            excludeExtraneousValues: true
        });

        if (deprecatedConfig && deprecatedConfig.urls && deprecatedConfig.gitlaburls) {
            for (const downloader of configuration.downloader) {
                if (downloader.id == GitLabDownloader.ID && deprecatedConfig.urls) {
                    downloader.urlPatterns = deprecatedConfig.gitlaburls || [];
                } else if (downloader.id == GitHubDownloader.ID) {
                    downloader.urlPatterns = deprecatedConfig.urls || [];
                }
            }


            if (deprecatedConfig.contextMenu) {
                for (const menuItem of configuration.contextMenu) {
                    if (menuItem.id === Action.SAVE_AS && Util.isNotNull(deprecatedConfig.contextMenu.saveas)) {
                        menuItem.active = Boolean(deprecatedConfig.contextMenu.saveas);
                    } else if (menuItem.id === Action.DOWNLOAD && Util.isNotNull(deprecatedConfig.contextMenu.download)) {
                        menuItem.active = Boolean(deprecatedConfig.contextMenu.download);
                    }
                }
            }

            await this.chromeStorageService.clearStorage();
            await this.chromeStorageService.save(configuration);
        }
    }
}