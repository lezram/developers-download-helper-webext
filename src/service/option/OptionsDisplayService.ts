import {inject, singleton} from "tsyringe";
import {ConfigurationService} from "../ConfigurationService";
import {Util} from "../../util/Util";
import {DownloaderRegistry} from "../downloader/DownloaderRegistry";
import {ExtensionConfiguration} from "../../configuration/ExtensionConfiguration";
import {ChromePermissionService} from "../chrome/ChromePermissionService";
import {PermissionRequestFailedException} from "../../exception/PermissionRequestFailedException";
import {InvalidUrlMatchPatternException} from "../../exception/InvalidUrlMatchPatternException";

@singleton()
export class OptionsDisplayService {

    constructor(
        @inject(ChromePermissionService) private chromePermissionService: ChromePermissionService,
        @inject(ConfigurationService) private configurationService: ConfigurationService,
        @inject(ExtensionConfiguration) private extensionConfiguration: ExtensionConfiguration,
        @inject(DownloaderRegistry) private downloaderRegistry: DownloaderRegistry
    ) {
    }


    public async showOptionsHtml(optionsWrapperElement: HTMLDivElement): Promise<void> {
        const actionItems = this.extensionConfiguration.getActionItems();
        const downloadersMetadata = this.downloaderRegistry.getAllDownloadersMetadata();
        const configuration = await this.configurationService.getConfiguration();

        let contextDownloader = "<h2>Custom Domains</h2>";
        for (const downloader of downloadersMetadata) {
            let downloaderConfiguration = configuration.downloader.get(downloader.id);

            if (
                (downloader && downloader.configuration && downloader.configuration.disabled === true) ||
                (downloaderConfiguration && downloaderConfiguration.disabled === true)
            ) {
                continue;
            }

            let permissionsAsString = "";
            if (Util.isNotNull(downloaderConfiguration)) {
                permissionsAsString = downloaderConfiguration.permissions.join(', ');
            }

            // TODO: const linkPatternsAsString = downloaderConfiguration.linkPatterns.join(', ');

            contextDownloader += `<div class="configuration_block">\n`;
            contextDownloader += `<span class="bold">${downloader.name}</span>\n`;
            contextDownloader += `<span class="description">Additional ${downloader.name} domains e.g. "https://github.my.com/*, ..."; <a href="https://developer.chrome.com/extensions/match_patterns">URL Pattern</a></span>\n`;
            contextDownloader += `<input type="text" id="${this.getDownloaderSettingHtmlId(downloader.id)}" title="${downloader.name} Domains" style="width: 100%;" value="${permissionsAsString}">\n`;
            contextDownloader += `</div>\n\n`;
        }

        let contextMenuHtml = "<h2>Context Menu</h2>";
        for (const item of actionItems) {
            let menuItemConfiguration = configuration.contextMenu.get(item.id);

            let isActive = Boolean(item.defaultActive);
            if (menuItemConfiguration && Util.isNotNull(menuItemConfiguration.active)) {
                isActive = menuItemConfiguration.active;
            }


            let checked = "";
            if (isActive) {
                checked = " checked";
            }

            contextMenuHtml += `<div class="configuration_block">`;
            contextMenuHtml += `<input type="checkbox" id="${this.getContextMenuSettingHtmlId(item.id)}"${checked}>`;
            contextMenuHtml += ` ${item.title}`;
            contextMenuHtml += `</div>`;
        }

        optionsWrapperElement.innerHTML = `<div>${contextDownloader}</div><div class="divider"></div><div>${contextMenuHtml}</div>`;
    }


    public async saveUpdatedOptions(optionsElement: HTMLElement): Promise<void> {
        const actionItems = this.extensionConfiguration.getActionItems();
        const downloadersMetadata = this.downloaderRegistry.getAllDownloadersMetadata();
        const configuration = await this.configurationService.getConfiguration();

        for (const downloader of downloadersMetadata) {
            const serviceElement: HTMLInputElement = <HTMLInputElement>optionsElement.querySelector(
                "#" + this.getDownloaderSettingHtmlId(downloader.id)
            );

            if (serviceElement) {
                const urls = this.getValidUrls(serviceElement.value);

                let downloaderConfiguration = configuration.downloader.get(downloader.id);
                if (!downloaderConfiguration) {
                    downloaderConfiguration = {
                        linkPatterns: [],
                        permissions: []
                    };
                    configuration.downloader.set(downloader.id, downloaderConfiguration);
                }

                // TODO: remove permissions
                if (urls.length <= 0) {
                    downloaderConfiguration.linkPatterns = [];
                    downloaderConfiguration.permissions = [];
                } else if (await this.chromePermissionService.requestUrlPermission(urls)) {
                    downloaderConfiguration.linkPatterns = urls;
                    downloaderConfiguration.permissions = urls;
                } else {
                    throw new PermissionRequestFailedException("Permissions not granted");
                }
            }
        }

        for (const item of actionItems) {
            const menuItemElement: HTMLInputElement = <HTMLInputElement>optionsElement.querySelector(
                "#" + this.getContextMenuSettingHtmlId(item.id)
            );

            if (menuItemElement) {
                let menuItemConfiguration = configuration.contextMenu.get(item.id);
                if (!menuItemConfiguration) {
                    menuItemConfiguration = {
                        active: true
                    };
                    configuration.contextMenu.set(item.id, menuItemConfiguration);
                }

                menuItemConfiguration.active = Boolean(menuItemElement.checked);
            }
        }

        await this.configurationService.saveConfiguration(configuration);
    }

    private getValidUrls(urlRawValue: string): string[] {
        let urlPatterns = urlRawValue.replace(" ", "").split(/,|;/);

        let urls: string[] = [];
        for (let url of urlPatterns) {
            if (url) {
                if (Util.isUrlMatchPatternValid(url)) {
                    urls.push(url);
                } else {
                    throw new InvalidUrlMatchPatternException("Invalid url match pattern");
                }
            }
        }

        return urls;
    }

    private getDownloaderSettingHtmlId(downloaderId: string) {
        return `service_${downloaderId}_url_pattern`;
    }

    private getContextMenuSettingHtmlId(menuId: string) {
        return `menu_${menuId}_active`;
    }
}