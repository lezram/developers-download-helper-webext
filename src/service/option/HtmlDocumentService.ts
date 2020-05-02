import {singleton} from "tsyringe";
import {IllegalArgumentException} from "../../exception/IllegalArgumentException";
import {HtmlElementNotFoundException} from "../../exception/HtmlElementNotFoundException";

@singleton()
export class HtmlDocumentService {

    private readonly htmlDocument;

    constructor() {
        this.htmlDocument = document;
    }

    public getElement(id: string): HTMLElement {

        if (!this.htmlDocument) {
            throw new IllegalArgumentException("document not set");
        }

        let element = this.htmlDocument.getElementById(id);

        if (!element) {
            throw new HtmlElementNotFoundException(`HTML element with id ${id} not found`);
        }

        return element;
    }

    public onClick(id: string, callback: () => Promise<void>): void {
        this.getElement(id).addEventListener('click', async () => {
            await callback();
        });
    }

}