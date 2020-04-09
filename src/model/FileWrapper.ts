export enum FileType {
    RAW,
    URL,
}

export class FileWrapper {
    type?: FileType;
    name: string;
    content: any;

}