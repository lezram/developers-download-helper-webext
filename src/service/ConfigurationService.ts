import 'reflect-metadata';
import {inject, singleton} from "tsyringe";
import {Configuration} from "../model/Configuration";
import {ExtensionConfiguration} from "../configuration/ExtensionConfiguration";
import {ChromeStorageService} from "./chrome/ChromeStorageService";
import {ConfigurationMigrationService} from "./ConfigurationMigrationService";
import {plainToClass} from "class-transformer";

@singleton()
export class ConfigurationService {

    constructor(@inject(ExtensionConfiguration) private extensionConfiguration: ExtensionConfiguration,
                @inject(ConfigurationMigrationService) private configurationMigrationService: ConfigurationMigrationService,
                @inject(ChromeStorageService) private chromeStorageService: ChromeStorageService
    ) {
    }

    public async getConfiguration(): Promise<Configuration> {
        let defaultConfiguration = this.extensionConfiguration.getDefaultConfiguration();

        await this.configurationMigrationService.migrateConfigurationIfNeeded(defaultConfiguration);

        let rawConfiguration = await this.chromeStorageService.load<Configuration>(defaultConfiguration);

        return plainToClass(Configuration, rawConfiguration, {
            excludeExtraneousValues: true,
        });
    }

    public async saveConfiguration(configuration: Configuration): Promise<void> {
        await this.chromeStorageService.save(configuration);
    }

    public addConfigurationChangeListener(onConfigurationChange: (configuration: Configuration) => Promise<void>) {
        this.chromeStorageService.addOnChangeListener(async (changes, namespace) => {
            const configuration = await this.getConfiguration();
            await onConfigurationChange(configuration);
        })
    }
}