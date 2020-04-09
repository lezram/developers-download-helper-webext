import {inject, singleton} from "tsyringe";
import {ConfigurationService} from "./ConfigurationService";
import {Util} from "../util/Util";

@singleton()
export class OptionsService {

    constructor(@inject(ConfigurationService) private configurationService: ConfigurationService) {
    }

    public async createOptionsHtml(): Promise<string> {
        let configuration = await this.configurationService.getConfiguration();

        let contextDownloader = "<h2>Services</h2>";
        for (const downloader of configuration.downloader) {
            const patternsAsString = downloader.urlPatterns.join(', ');

            contextDownloader += `<div class="configuration_block">\n`;
            contextDownloader += `<span class="bold">${downloader.name}</span>\n`;
            contextDownloader += `<span class="description">e.g. "https://github.com/*, https://github.my.com/*"; <a href="https://developer.chrome.com/extensions/match_patterns">URL Pattern</a></span>\n`;
            contextDownloader += `<input type="text" id="${this.getDownloaderSettingHtmlId(downloader.id)}" title="${downloader.name} URL Pattern" style="width: 100%;" value="${patternsAsString}">\n`;
            contextDownloader += `</div>\n\n`;
        }

        let contextMenuHtml = "<h2>Context Menu</h2>";
        for (const menuItem of configuration.contextMenu) {

            let checked = "";
            if (menuItem.active) {
                checked = " checked";
            }

            contextMenuHtml += `<div class="configuration_block">`;
            contextMenuHtml += `<input type="checkbox" id="${this.getContextMenuSettingHtmlId(menuItem.id)}"${checked}>`;
            contextMenuHtml += ` ${menuItem.title}`;
            contextMenuHtml += `</div>`;
        }

        return `<div>${contextDownloader}</div><div class="divider"></div><div>${contextMenuHtml}</div>`;
    }


    public async saveUpdatedOptions(optionsElement: HTMLElement): Promise<void> {
        let configuration = await this.configurationService.getConfiguration();

        for (const downloader of configuration.downloader) {
            const serviceElement: HTMLInputElement = <HTMLInputElement>optionsElement.querySelector(
                "#" + this.getDownloaderSettingHtmlId(downloader.id)
            );

            if (serviceElement && serviceElement.value) {
                const urls = this.getValidUrls(serviceElement.value);

                if (urls && urls.length > 0) {
                    downloader.urlPatterns = urls;
                }
            }
        }

        for (const menuItem of configuration.contextMenu) {
            const menuItemElement: HTMLInputElement = <HTMLInputElement>optionsElement.querySelector(
                "#" + this.getContextMenuSettingHtmlId(menuItem.id)
            );

            if (menuItemElement) {
                menuItem.active = Boolean(menuItemElement.checked);
            }
        }

        await this.configurationService.saveConfiguration(configuration);
    }

    private getValidUrls(urlRawValue: string): string[] {
        let urlPatterns = urlRawValue.replace(" ", "").split(/,|;/);

        let urls: string[] = [];
        for (let url of urlPatterns) {
            if (Util.isUrlPatternValid(url)) {
                urls.push(url);
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