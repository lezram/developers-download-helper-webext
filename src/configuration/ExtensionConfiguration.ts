import {injectable} from "tsyringe";
import {Action} from "../model/Action";
import {ActionItemMetadata} from "../model/ActionItemMetadata";

@injectable()
export class ExtensionConfiguration {
    
    public getActionItems(): ActionItemMetadata[] {
        return [
            {
                id: Action.SAVE_AS,
                title: "Save as...",
                defaultActive: true
            },
            {
                id: Action.DOWNLOAD,
                title: "Download",
                defaultActive: false
            },
        ]

    }
}