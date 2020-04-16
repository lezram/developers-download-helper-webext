import {inject, singleton} from "tsyringe";
import {HTMLStatusHandler} from "./option/HTMLStatusHandler";
import {OptionsDisplayService} from "./option/OptionsDisplayService";

@singleton()
export class OptionService {

    public constructor(
        @inject(OptionsDisplayService) private optionsDisplayService: OptionsDisplayService
    ) {
    }

    public async showAndHandleOptions(): Promise<void> {
        const statusHandler = new HTMLStatusHandler(document, "status", chrome.runtime.getManifest().homepage_url);

        try {
            const contentElement: HTMLDivElement = <HTMLDivElement>document.getElementById("content");
            await this.optionsDisplayService.showOptionsHtml(contentElement);

            document.getElementById("save").addEventListener('click', async () => {
                try {
                    await this.optionsDisplayService.saveUpdatedOptions(contentElement);
                    statusHandler.showStatus("Options saved");
                } catch (error) {
                    statusHandler.showStatus("Save options failed", error);
                }
            });
        } catch (error) {
            statusHandler.showStatus("Unexpected error", error);
        }
    }

}