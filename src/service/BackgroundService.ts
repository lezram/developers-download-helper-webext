import {inject, singleton} from "tsyringe";
import {ConfigurationService} from "./ConfigurationService";
import {ContextMenuService} from "./context-menu/ContextMenuService";

@singleton()
export class BackgroundService {

    public constructor(
        @inject(ConfigurationService) private configurationService: ConfigurationService,
        @inject(ContextMenuService) private contextMenuService: ContextMenuService
    ) {
    }

    public async run(): Promise<void> {
        const configuration = await this.configurationService.getConfiguration();

        this.contextMenuService.createContextMenus(configuration);

        this.configurationService.addConfigurationChangeListener(async (configuration): Promise<void> => {
            this.contextMenuService.updateContextMenus(configuration);
        });
    }

}