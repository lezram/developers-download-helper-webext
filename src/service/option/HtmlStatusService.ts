import {inject, singleton} from "tsyringe";
import {BrowserRuntimeService} from "../browser/BrowserRuntimeService";

@singleton()
export class HtmlStatusService {

    constructor(
        @inject(BrowserRuntimeService) private readonly browserRuntimeService: BrowserRuntimeService
    ) {
    }

    public showStatus(statusElement: HTMLDivElement, message: string, details?: any): void {
        let backgroundColor = "green";
        statusElement.style.display = "inline-block";

        let detailContent = "";
        if (!details) {
            setTimeout((): void => {
                statusElement.style.display = "none";
            }, 750);
        } else {
            backgroundColor = "red";
            let messageDetails;
            if (details instanceof Error) {
                messageDetails = {
                    error: details.message,
                    details: details
                }
            } else {
                messageDetails = {
                    details: details
                }
            }

            const url = this.browserRuntimeService.getHomePageUrl();

            detailContent += `<div style="display: inline; font-size: 0.6em;"> Details below ...</div>
                <div style="width: 100%;
                    position: absolute;
                    left: 0;
                    margin-top: 2em;">
                    <textarea style="
                        width: 100%;
                        background: #ff0000;
                        resize: vertical;
                        border: none;
                        color: white;" rows="2" disabled>${JSON.stringify(messageDetails)}</textarea>
                    <div style="padding: 1em;">
                         If you think this behaviour is incorrect, report this issue:
                         <a href="${url}">${url}</a>
                    </div>
                </div>`;
        }

        statusElement.innerHTML = `<div class="status" style="font-size: 0.8em;
            display: inline-block;
            color: white;
            padding: 0.4em;
            border-radius: 0.3em;
            margin-left: 1em;
            background: ${backgroundColor}">${message}</div>${detailContent}`;
    }

}
