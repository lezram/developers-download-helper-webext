import {FileType} from "./FileType";
import {Utils} from "./Utils";
import * as ZIP from "jszip";
import {UrlBuilder} from "./UrlBuilder";

export default class GithubURL {
    private _link: HTMLAnchorElement;
    private _user: string;
    private _repository: string;
    private _fileType: string;
    private _branch: string;
    private _filePath: string;

    constructor(url: string) {
        this._link = <HTMLAnchorElement> document.createElement('a');
        this._link.href = url;

        let regex: RegExp = /^\/([^\/]+)\/([^\/]+)\/?([^\/]+)?\/?([^\/]+)?\/?(.*)?$/g;
        let match: RegExpExecArray = regex.exec(this._link.pathname);

        if (match) {
            let matchLength: number = Utils.getMatchLength(match);
            if (matchLength === 6) {
                // .../1:user/2:repo/3:type/4:branch/5:path
                this._user = match[1];
                this._repository = match[2];
                this._fileType = match[3];
                this._branch = match[4];
                this._filePath = match[5];
            }
            else if (matchLength === 5) {
                // .../1:user/2:repo/3:type/4:branch
                this._user = match[1];
                this._repository = match[2];
                this._fileType = FileType.ZIPBALL;
                this._branch = match[4];
                this._filePath = null;
            }
            else if (matchLength === 3) {
                // .../1:user/2:repo
                this._user = match[1];
                this._repository = match[2];
                this._fileType = FileType.ZIPBALL;
                this._branch = null;
                this._filePath = null;
            }
            else {
                throw new Error("Invalid URL " + url);
            }
        }
        else {
            throw new Error("Invalid URL " + url);
        }
    }

    private getApiUrl(): string {
        let urlBuilder = new UrlBuilder(this._link).removePath();

        if (this._link.hostname === "github.com") {
            urlBuilder.addSubdomain("api");
        }
        else {
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
        }
        else {
            urlBuilder.slash(FileType.ZIPBALL);
        }

        urlBuilder.slash(this._branch || "master");
        urlBuilder.slash(this._filePath);

        return urlBuilder.build();
    }


    protected createUrlEncodedZip(url: string) {
        return new Promise((resolveParent, rejectParent) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
                let arrayBuffer = xhr.response;

                if (!arrayBuffer) {
                    rejectParent({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }


                let zipLoader = new ZIP();
                zipLoader.loadAsync(arrayBuffer).then((zip) => {
                    let foldernameInZip = Utils.first(zip.files) + this._filePath;

                    if (!foldernameInZip) {
                        rejectParent(null);
                    }

                    let newZip = new ZIP();
                    zip.folder(foldernameInZip).forEach(function (relativePath, file) {
                        newZip.file(relativePath, file.async("arraybuffer"));
                    });

                    let options = {
                        type: "base64",
                        mimeType: "application/zip"
                    };

                    newZip.generateAsync(options).then(function (base64) {
                        let dataURL = 'data:application/zip;base64,' + base64;
                        resolveParent(dataURL);
                    });
                });
            };
            xhr.onerror = function () {
                rejectParent({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }

    getDownloadUrl() {
        return new Promise((resolve, reject) => {
            let request: XMLHttpRequest = new XMLHttpRequest();
            request.onreadystatechange = () => {

                if (request.readyState == 4) {
                    let downloadUrl = null;

                    if (request.status == 200) {
                        let data: any = JSON.parse(request.responseText);

                        if (data.hasOwnProperty("archive_url")) {
                            downloadUrl = Utils.mustache(data.archive_url, {
                                "archive_format": FileType.ZIPBALL,
                                "/ref": "/" + (this._branch || "")
                            });
                        }
                        else if (data.hasOwnProperty("download_url")) {
                            downloadUrl = data.download_url;
                        }
                        else if (this._fileType == FileType.TREE && data instanceof Array) {
                            if (data.length <= 0) {
                                reject();
                            }
                        }
                    }

                    if (!downloadUrl) {
                        downloadUrl = this.getFallbackDownloadUrl();
                    }

                    if (this._fileType == FileType.TREE) {
                        this.createUrlEncodedZip(downloadUrl).then(urlEncodedZip => {
                            resolve(urlEncodedZip);
                        });
                    }
                    else {
                        resolve(downloadUrl);
                    }
                }
            };
            request.open("GET", this.getApiUrl());
            request.send();
        });


    }

    get link(): HTMLAnchorElement {
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