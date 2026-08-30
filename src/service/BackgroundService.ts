import {inject, singleton} from "tsyringe";
import {ConfigurationService} from "./ConfigurationService";
import {ContextMenuService} from "./context-menu/ContextMenuService";
import {BrowserActionService} from "./browser/BrowserActionService";
import {BrowserRuntimeService} from "./browser/BrowserRuntimeService";

@singleton()
export class BackgroundService {

    public constructor(
        @inject(ConfigurationService) private configurationService: ConfigurationService,
        @inject(ContextMenuService) private contextMenuService: ContextMenuService,
        @inject(BrowserActionService) private browserActionService: BrowserActionService,
        @inject(BrowserRuntimeService) private browserRuntimeService: BrowserRuntimeService
    ) {
    }

    /**
     * Event listeners have to be registered synchronously on startup, otherwise the
     * service worker misses the events it was started for.
     */
    public registerListeners(): void {
        this.contextMenuService.registerContextMenuClickListener();

        this.browserActionService.addOnClickListener(async (): Promise<void> => {
            await this.browserRuntimeService.openOptionsPage();
        });

        this.configurationService.addConfigurationChangeListener(async (configuration): Promise<void> => {
            await this.contextMenuService.updateContextMenus();
        });
    }

    public async run(): Promise<void> {
        await this.contextMenuService.createContextMenus();
    }
}
