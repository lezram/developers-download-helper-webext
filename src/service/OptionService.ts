import {inject, singleton} from "tsyringe";
import {HtmlOptionsService} from "./option/HtmlOptionsService";
import {HtmlDocumentService} from "./option/HtmlDocumentService";
import {HtmlStatusService} from "./option/HtmlStatusService";

@singleton()
export class OptionService {
    private static readonly STATUS_ELEMENT_ID = "status";
    private static readonly SAVE_ELEMENT_ID = "save";
    private static readonly CONTENT_ELEMENT_ID = "content";

    public constructor(
        @inject(HtmlOptionsService) private readonly optionsDisplayService: HtmlOptionsService,
        @inject(HtmlDocumentService) private readonly htmlDocumentService: HtmlDocumentService,
        @inject(HtmlStatusService) private readonly htmlStatusService: HtmlStatusService
    ) {
    }

    public async showAndHandleOptions(): Promise<void> {
        try {
            const contentElement: HTMLDivElement = <HTMLDivElement>this.htmlDocumentService
                .getElement(OptionService.CONTENT_ELEMENT_ID);
            await this.optionsDisplayService.showOptionsHtml(contentElement);

            this.htmlDocumentService.onClick(OptionService.SAVE_ELEMENT_ID, async () => {
                try {
                    await this.optionsDisplayService.saveUpdatedOptions(contentElement);
                    this.showStatus("Options saved");
                } catch (error) {
                    this.showStatus("Save options failed", error);
                }
            });
        } catch (error) {
            this.showStatus("Unexpected error", error);
        }
    }

    private showStatus(message: string, details?: any): void {
        let statusElement: HTMLDivElement = <HTMLDivElement>this.htmlDocumentService
            .getElement(OptionService.STATUS_ELEMENT_ID);

        this.htmlStatusService.showStatus(statusElement, message, details);
    }

}