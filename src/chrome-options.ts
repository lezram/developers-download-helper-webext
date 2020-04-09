/**
 *  Options script, which is used in option.html
 */
import "reflect-metadata";
import {container} from "tsyringe";
import {OptionsService} from "./service/OptionsService";

function showStatus(element: HTMLElement, errorDetailsElement: HTMLTextAreaElement, text: string, error?: any) {
    element.textContent = text;
    element.style.display = "inline-block";

    if (!error) {
        element.style.background = "green";
        errorDetailsElement.style.display = "none";

        setTimeout(() => {
            element.textContent = "";
            element.style.display = "none";
        }, 750);
    } else {
        element.style.background = "red";
        errorDetailsElement.style.display = "block";
        errorDetailsElement.value = "Please report this issue to\n"
            + chrome.runtime.getManifest().homepage_url + "\n\n"
            + JSON.stringify({
                error: error.message,
                details: error
            });
    }
}

(async (): Promise<void> => {
    const contentElement: HTMLElement = document.getElementById("content");
    const saveElement: HTMLButtonElement = <HTMLButtonElement>document.getElementById("save");
    const statusElement: HTMLElement = document.getElementById("status");
    const errorDetailsElement: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("errorDetails");

    try {
        const optionsService = container.resolve(OptionsService);

        contentElement.innerHTML = await optionsService.createOptionsHtml();

        saveElement.addEventListener('click', async () => {
            try {
                await optionsService.saveUpdatedOptions(contentElement);
                showStatus(statusElement, errorDetailsElement, "Options saved");
            } catch (error) {

                console.log("error", error);
                showStatus(statusElement, errorDetailsElement, "Save options failed", error);
            }
        });

    } catch (error) {
        showStatus(statusElement, errorDetailsElement, "Unexpected error", error);
    }
})();