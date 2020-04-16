import {inject, singleton} from "tsyringe";
import {Configuration, ContextMenuItemConfiguration, DownloaderConfiguration} from "../model/Configuration";
import {ExtensionConfiguration} from "../configuration/ExtensionConfiguration";
import {ChromeStorageService} from "./chrome/ChromeStorageService";
import {ConfigurationMigrationService} from "./ConfigurationMigrationService";
import {Util} from "../util/Util";
import {ActionItemMetadata} from "../model/ActionItemMetadata";
import {Action} from "../model/Action";

@singleton()
export class ConfigurationService {

    private configurationCache: Configuration;

    constructor(@inject(ExtensionConfiguration) private extensionConfiguration: ExtensionConfiguration,
                @inject(ConfigurationMigrationService) private configurationMigrationService: ConfigurationMigrationService,
                @inject(ChromeStorageService) private chromeStorageService: ChromeStorageService,
    ) {
    }

    public async getConfiguration(): Promise<Configuration> {
        const migrationNeeded = await this.configurationMigrationService.migrateConfigurationIfNeeded();

        if (migrationNeeded || Util.isNull(this.configurationCache)) {
            const rawConfiguration = await this.chromeStorageService.load<Configuration>(Object.keys(new Configuration()));

            const configuration = new Configuration();

            if (rawConfiguration && Util.isNotNull(rawConfiguration.contextMenu)) {
                configuration.contextMenu = new Map<Action, ContextMenuItemConfiguration>(rawConfiguration.contextMenu);
            } else {
                configuration.contextMenu = new Map<Action, ContextMenuItemConfiguration>();
            }

            if (rawConfiguration && Util.isNotNull(rawConfiguration.downloader)) {
                configuration.downloader = new Map<string, DownloaderConfiguration>(rawConfiguration.downloader);
            } else {
                configuration.downloader = new Map<string, DownloaderConfiguration>();
            }

            this.configurationCache = configuration;
        }

        return this.configurationCache;
    }

    public async saveConfiguration(configuration: Configuration): Promise<void> {
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

        this.configurationCache = null;
        await this.chromeStorageService.save(rawConfiguration);
    }

    public addConfigurationChangeListener(onConfigurationChange: (configuration: Configuration) => Promise<void>) {
        this.chromeStorageService.addOnChangeListener(async (changes, namespace) => {
            this.configurationCache = null;
            const configuration = await this.getConfiguration();
            await onConfigurationChange(configuration);
        })
    }

    public async getActiveActionItems(): Promise<ActionItemMetadata[]> {
        const activeActionItems: ActionItemMetadata[] = [];

        let configuration = await this.getConfiguration();

        let actionItems = this.extensionConfiguration.getActionItems();
        for (const item of actionItems) {
            let contextMenuItemConfiguration = null;
            if (configuration && configuration.contextMenu) {
                contextMenuItemConfiguration = configuration.contextMenu.get(item.id);
            }

            if (
                (this.isValidContextMenuItemConfiguration(contextMenuItemConfiguration)
                    && contextMenuItemConfiguration.active === true)
                ||
                (!this.isValidContextMenuItemConfiguration(contextMenuItemConfiguration)
                    && item.defaultActive === true)
            ) {
                activeActionItems.push(item);
            }
        }

        return activeActionItems;
    }

    public async getDownloaderCustomConfiguration(downloaderId: string): Promise<DownloaderConfiguration> {
        let configuration = await this.getConfiguration();

        if (configuration && configuration.downloader) {
            return configuration.downloader.get(downloaderId);
        }

        return null;
    }

    private isValidContextMenuItemConfiguration(menuItemConfiguration: ContextMenuItemConfiguration) {
        return menuItemConfiguration && Util.isNotNull(menuItemConfiguration.active);
    }


}