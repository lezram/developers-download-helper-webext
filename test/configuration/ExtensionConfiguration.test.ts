import {container} from "tsyringe";
import {ExtensionConfiguration} from "../../src/configuration/ExtensionConfiguration";
import {Action} from "../../src/model/Action";

describe("ExtensionConfiguration", (): void => {

    let testee: ExtensionConfiguration;

    beforeEach((): void => {
        container.reset();
        testee = container.resolve(ExtensionConfiguration);
    });

    test("testGetActionItems", async (): Promise<void> => {
        let actionItems = testee.getActionItems();

        const actions = Object.keys(Action);
        for (const key of actions) {

            let contains = false;
            for (const actionItem of actionItems) {
                if (actionItem.id === key) {
                    contains = true;
                    break;
                }
            }

            expect(contains).toBeTruthy();
        }
    });
});