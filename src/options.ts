/**
 *  Options script, which is used in option.html
 */
import "reflect-metadata";
import {container} from "tsyringe";
import {OptionService} from "./service/OptionService";

(async (): Promise<void> => {
    await container.resolve(OptionService).showAndHandleOptions();
})();