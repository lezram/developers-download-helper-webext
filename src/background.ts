/**
 *  Background runner
 */
import "reflect-metadata";
import {container} from "tsyringe";
import {BackgroundService} from "./service/BackgroundService";

(async (): Promise<void> => {
    await container.resolve(BackgroundService).run();
})();
