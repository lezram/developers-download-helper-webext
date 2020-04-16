import {inject, singleton} from "tsyringe";
import {ChromeStorageService} from "./chrome/ChromeStorageService";
import {Configuration} from "../model/Configuration";
import {DeprecatedConfiguration} from "../model/DeprecatedConfiguration";
import {GitLabDownloader} from "./downloader/gitlab/GitLabDownloader";
import {GitHubDownloader} from "./downloader/github/GitHubDownloader";
import {Action} from "../model/Action";
import {Util} from "../util/Util";
import {DownloaderRegistry} from "./downloader/DownloaderRegistry";
import {DownloaderMetadata} from "../model/DownloaderMetadata";

@singleton()
export class ConfigurationMigrationService {

    constructor(@inject(ChromeStorageService) private chromeStorageService: ChromeStorageService,
                @inject(DownloaderRegistry) private downloaderRegistry: DownloaderRegistry) {
    }

    public async migrateConfigurationIfNeeded(): Promise<boolean> {
        let migrationNeeded = false;

        const deprecatedConfiguration = await this.chromeStorageService.load<DeprecatedConfiguration>([
            "urls", "gitlaburls", "contextMenu"
        ]);

        if (deprecatedConfiguration && deprecatedConfiguration.urls && deprecatedConfiguration.gitlaburls) {
            const configuration = new Configuration();

            const customGithubUrls = this.removeDownloaderDefaultUrls(GitHubDownloader.ID, deprecatedConfiguration.urls);
            if (customGithubUrls.length > 0) {
                configuration.downloader.set(GitHubDownloader.ID, {
                    linkPatterns: customGithubUrls,
                    permissions: customGithubUrls
                });
            }

            const customGitlabUrls = this.removeDownloaderDefaultUrls(GitLabDownloader.ID, deprecatedConfiguration.gitlaburls);
            if (customGitlabUrls.length > 0) {
                configuration.downloader.set(GitLabDownloader.ID, {
                    linkPatterns: customGitlabUrls,
                    permissions: customGitlabUrls
                });
            }

            if (deprecatedConfiguration.contextMenu) {
                if (Util.isNotNull(deprecatedConfiguration.contextMenu.saveas)) {
                    configuration.contextMenu.set(Action.SAVE_AS, {
                        active: Boolean(deprecatedConfiguration.contextMenu.saveas)
                    });
                }

                if (Util.isNotNull(deprecatedConfiguration.contextMenu.download)) {
                    configuration.contextMenu.set(Action.DOWNLOAD, {
                        active: Boolean(deprecatedConfiguration.contextMenu.download)
                    });
                }
            }

            const rawConfiguration = {
                contextMenu: [],
                downloader: []
            };

            if (configuration && Util.isNotNull(configuration.contextMenu)) {
                rawConfiguration.contextMenu = [...configuration.contextMenu];
            }

            if (configuration && Util.isNotNull(configuration.downloader)) {
                rawConfiguration.downloader = [...configuration.downloader];
            }

            migrationNeeded = true;
            await this.chromeStorageService.clearStorage();
            await this.chromeStorageService.save(rawConfiguration);
        }

        return migrationNeeded;
    }

    private removeDownloaderDefaultUrls(downloaderId: string, urls: string[]) {
        const filteredUrls = [];

        if (Array.isArray(urls)) {
            let downloaderUrls = this.getDownloaderUrls(downloaderId);

            for (const url of urls) {
                if (Util.isUrlMatchPatternValid(url) && !this.isUrlHostIn(url, downloaderUrls)) {
                    filteredUrls.push(url);
                }
            }
        }

        return filteredUrls;
    }

    private isUrlHostIn(url: string, defaultUrls: string[]) {
        const currentUrl = new URL(url);

        if (!currentUrl) {
            return true;
        }

        for (const defaultUrl of defaultUrls) {
            const defaultUrlObj = new URL(defaultUrl);

            if (defaultUrlObj &&
                (
                    currentUrl.host.endsWith(defaultUrlObj.host) ||
                    defaultUrlObj.host.endsWith(currentUrl.host)
                )
            ) {
                return true;
            }
        }

        return false;
    }

    private getDownloaderUrls(id: string) {

        const downloaderUrls = [];

        let downloader = this.downloaderRegistry.getDownloader(id);

        if (downloader) {
            let metadata: DownloaderMetadata = downloader.getMetadata();

            if (metadata && metadata.configuration && metadata.configuration.permissions) {
                downloaderUrls.push(...metadata.configuration.permissions)
            }
        }

        return downloaderUrls;
    }
}