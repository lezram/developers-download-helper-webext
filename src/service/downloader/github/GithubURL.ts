import {FileType} from "./FileType";
import {Utils} from "./Utils";
import ZIP = require("jszip");
import {UrlBuilder} from "./UrlBuilder";

export default class GithubURL {
    private static readonly MATCH_PARTS_WITH_FILE_PATH = 6;
    private static readonly MATCH_PARTS_WITH_BRANCH = 5;
    private static readonly MATCH_PARTS_WITHOUT_BRANCH = 3;

    private _link: URL;
    private _user: string;
    private _repository: string;
    private _fileType: string;
    private _branch: string;
    private _filePath: string;

    constructor(url: string) {
        this._link = new URL(url);

        let regex: RegExp = /^\/([^\/]+)\/([^\/]+)\/?([^\/]+)?\/?([^\/]+)?\/?(.*)?$/g;
        let match: RegExpExecArray = regex.exec(this._link.pathname);

        if (!match) {
            throw new Error("Invalid URL " + url);
        }

        const [, user, repository, fileType, branch, filePath] = match;
        const matchLength: number = Utils.getMatchLength(match);

        if (matchLength === GithubURL.MATCH_PARTS_WITH_FILE_PATH) {
            this._user = user;
            this._repository = repository;
            this._fileType = fileType;
            this._branch = branch;
            this._filePath = filePath;
        } else if (matchLength === GithubURL.MATCH_PARTS_WITH_BRANCH) {
            this._user = user;
            this._repository = repository;
            this._fileType = FileType.ZIPBALL;
            this._branch = branch;
            this._filePath = null;
        } else if (matchLength === GithubURL.MATCH_PARTS_WITHOUT_BRANCH) {
            this._user = user;
            this._repository = repository;
            this._fileType = FileType.ZIPBALL;
            this._branch = null;
            this._filePath = null;
        } else {
            throw new Error("Invalid URL " + url);
        }
    }

    private getApiUrl(): string {
        let urlBuilder = new UrlBuilder(this._link).removePath();

        if (this._link.hostname === "github.com") {
            urlBuilder.addSubdomain("api");
        } else {
            urlBuilder.slash("api/v3");
        }

        urlBuilder.slash("repos").slash(this._user).slash(this._repository);

        if (this._filePath) {
            urlBuilder.slash("contents").slash(this._filePath);
        }

        if (this._branch) {
            urlBuilder.addQuery("ref", this._branch);
        }

        return urlBuilder.build();
    }


    private getFallbackDownloadUrl() {
        let urlBuilder = new UrlBuilder(this._link).removePath();

        urlBuilder.slash(this._user).slash(this._repository);

        if (this._filePath && this._fileType == FileType.BLOB) {
            urlBuilder.slash(FileType.RAW);
            urlBuilder.slash(this._branch || "master");
            urlBuilder.slash(this._filePath);
        } else {
            urlBuilder.slash(FileType.ZIPBALL);
            urlBuilder.slash(this._branch || "master");
        }

        return urlBuilder.build();
    }


    protected async extractFolderOfZipAsDataUri(url: string): Promise<string> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        if (!arrayBuffer) {
            throw {
                status: response.status,
                statusText: response.statusText
            };
        }

        const zip = await new ZIP().loadAsync(arrayBuffer);

        let foldernameInZip = Utils.getFirstKey(zip.files) + this._filePath;

        if (!foldernameInZip) {
            throw null;
        }

        let newZip = new ZIP();
        zip.folder(foldernameInZip).forEach(function (relativePath, file) {
            newZip.file(relativePath, file.async("arraybuffer"));
        });

        let options: ZIP.JSZipGeneratorOptions<'base64'> = {
            type: "base64",
            mimeType: "application/zip"
        };

        const base64 = await newZip.generateAsync(options);

        return 'data:application/zip;base64,' + base64;
    }

    async getDownloadUrl(): Promise<string> {
        let downloadUrl = null;

        const response = await fetch(this.getApiUrl());

        if (response.status == 200) {
            let data: any = await response.json();

            if (data.hasOwnProperty("archive_url")) {
                downloadUrl = Utils.mustache(data.archive_url, {
                    "archive_format": FileType.ZIPBALL,
                    "/ref": "/" + (this._branch || "")
                });
            } else if (data.hasOwnProperty("download_url")) {
                downloadUrl = data.download_url;
            } else if (this._fileType == FileType.TREE && data instanceof Array) {
                if (data.length <= 0) {
                    throw new Error("Resource not found " + this._link.href);
                }
            }
        }

        if (!downloadUrl) {
            downloadUrl = this.getFallbackDownloadUrl();
        }

        if (this._fileType == FileType.TREE) {
            return await this.extractFolderOfZipAsDataUri(downloadUrl);
        }

        return downloadUrl;
    }

    get link(): URL {
        return this._link;
    }

    get user(): string {
        return this._user;
    }

    get repository(): string {
        return this._repository;
    }

    get fileType(): string {
        return this._fileType;
    }

    get branch(): string {
        return this._branch;
    }

    get filePath(): string {
        return this._filePath;
    }
}