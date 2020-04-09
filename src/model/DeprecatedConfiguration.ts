import {Expose} from "class-transformer";

export class DeprecatedConfiguration {
    @Expose()
    urls: string[];

    @Expose()
    gitlaburls: string[];

    @Expose()
    contextMenu: { saveas: boolean, download: boolean };
}