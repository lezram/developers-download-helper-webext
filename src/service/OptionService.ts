import {inject, singleton} from "tsyringe";
import {HtmlOptionsService} from "./option/HtmlOptionsService";
import {HtmlDocumentService} from "./option/HtmlDocumentService";
import {HtmlStatusService} from "./option/HtmlStatusService";
import {PermissionRequestFailedException} from "../exception/PermissionRequestFailedException";

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

            const that = this;
            this.htmlDocumentService.onClick(OptionService.SAVE_ELEMENT_ID, () => {
                // Direct call, because some browsers cannot follow the call chain through Promises
                this.optionsDisplayService.manageUrlPermissions(contentElement).then(async function (urlPermissionGrated) {
                    try {
                        if (!urlPermissionGrated) {
                            throw new PermissionRequestFailedException("Permissions not granted");
                        }
                        await that.optionsDisplayService.saveUpdatedOptions(contentElement);
                        that.showStatus("Options saved");
                    } catch (error) {
                        that.showStatus("Save options failed", error);
                    }
                }).catch((error) => {
                    that.showStatus("Save options failed", error);
                });
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
