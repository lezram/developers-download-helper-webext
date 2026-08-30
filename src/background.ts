import "reflect-metadata";
import {container} from "tsyringe";
import {BackgroundService} from "./service/BackgroundService";

const backgroundService = container.resolve(BackgroundService);

backgroundService.registerListeners();

(async (): Promise<void> => {
    await backgroundService.run();
})();
