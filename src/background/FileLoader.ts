import * as ZIP from "jszip";

export default class FileLoader {
    // e.g. /1:user/2:repo/3:type/4:branch/5:path
    private static GITHUB_URL_REGEX: RegExp = /^\/([^\/]+)\/([^\/]+)\/?([^\/]+)?\/?([^\/]+)?\/?(.*)?$/g;
    private link: HTMLAnchorElement;
    private fileType: string;
    private filename: string;
    private path: string;

    constructor(url:string) {
        this.link = <HTMLAnchorElement> document.createElement('a');
        this.link.href = url;
        this.setResourceInformation();
    }

    private setResourceInformation(){
        let match: RegExpExecArray = FileLoader.GITHUB_URL_REGEX.exec(this.link["pathname"]);
        FileLoader.GITHUB_URL_REGEX.lastIndex = 0;

        if(match && this.isPageRepository(this.link.href)){
            let matchLength: number = FileLoader.getMatchLength(match);
            if(matchLength === 6){
                this.fileType = match[3];
                this.path = match[5];
                this.filename = match[5].substring(match[5].lastIndexOf('/') + 1);
            }
            else if(matchLength === 5){
                this.fileType = match[3];
                this.filename = match[2] + " - " + match[4];
                this.path = "";
            }
            else if(matchLength === 3){
                this.fileType = "project";
                this.filename = match[2];
                this.path = "";
            }
            else {
                throw new Error("Not supported");
            }
        }
        else {
            throw new Error("Not supported");
        }

    }

    getFilename() {
        return this.filename;
    }

    getDownloadURL() {
        switch (this.fileType) {
            case "blob":
                return this.replaceFileTypeInUrlWith("raw");
            case "tree":
                this.filename += ".zip";
                let that = this;
                return this.replaceFileTypeInUrlWith("zipball").then(function(url:string) {
                    return that.getFolderContentAsUrl(url);
                });
            case "commit":
                this.filename += ".zip";
                return this.replaceFileTypeInUrlWith("zipball");
            case "project":
                this.filename += ".zip";
                return this.replaceFileTypeInUrlWith("zipball");
            default:
                return new Promise(function(resolve) {
                    resolve(null)
                });
        }
    }

    replaceFileTypeInUrlWith(fileType: string) {
        let link: Node = this.link.cloneNode();
        let fnMatchLength = FileLoader.getMatchLength;

        return new Promise(function(resolve, reject) {
            let match = FileLoader.GITHUB_URL_REGEX.exec(link["pathname"]);
            FileLoader.GITHUB_URL_REGEX.lastIndex = 0;

            if (match && fnMatchLength(match) >= 5) {
                link["pathname"] = link["pathname"].replace(FileLoader.GITHUB_URL_REGEX, "/$1/$2/" + fileType + "/$4/$5");
                resolve(link["href"]);
            } else if (match && fnMatchLength(match) == 3) {
                link["pathname"] += "/" + fileType + "/";

                function resolveBranchName(branchName: string) {
                    if(!branchName) {
                        console.warn("Could not determine default branchname - defaulting to \"master\"");
                        branchName = "master";
                    }
                    link["pathname"] += branchName;
                    resolve(link["href"]);
                }

                let apiURL = "https://api.github.com/";
                if(link["host"] !== "github.com") {
                    apiURL = link["origin"] + "/api/v3/";
                }

                let xhr = new XMLHttpRequest();
                xhr.open("GET", apiURL + "repos/" + match[1] + "/" + match[2]);
                xhr.responseType = 'json';
                xhr.onload = function () {
                    let response = xhr.response;
                    if (!response) {
                        resolveBranchName(undefined);
                    }
                    resolveBranchName(response["default_branch"]);
                };
                xhr.onerror = function () {
                    resolveBranchName(undefined);
                };
                xhr.send();
            }
            else {
                resolve(null);
            }

        });
    }

    isPageRepository(url){
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url,false);
        xhr.send();
        if (xhr.readyState == 4 && xhr.status == 200) {
            let wrapper= document.createElement('div');
            wrapper.innerHTML= xhr.responseText;
            let classes = wrapper.getElementsByClassName("repository-content");
            if(classes.length > 0){
                return true;
            }
        }

        return false;
    }

    getFolderContentAsUrl(url) {
        let that = this;
        return new Promise(function(resolveParent, rejectParent) {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                let arrayBuffer = xhr.response; // Note: not oReq.responseText

                if (!arrayBuffer) {
                    rejectParent({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }


                let zipLoader = new ZIP();
                zipLoader.loadAsync(arrayBuffer).then(function(zip) {
                    let foldernameInZip = FileLoader.first(zip.files) + that.path;

                    if (!foldernameInZip) {
                        rejectParent(null);
                    }

                    let newZip = new ZIP();
                    zip.folder(foldernameInZip).forEach(function(relativePath, file) {
                        newZip.file(relativePath, file.async("arraybuffer"));
                    });

                    let options = {
                        type: "base64",
                        mimeType: "application/zip"
                    };

                    newZip.generateAsync(options).then(function(base64) {
                        let dataURL = 'data:application/zip;base64,' + base64;
                        resolveParent(dataURL);
                    });
                });
            };
            xhr.onerror = function() {
                rejectParent({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }

    private static first(object){
        let keys = Object.keys(object);
        if(keys.length > 0){
            return keys[0];
        }
        return null;
    }

    private static getMatchLength(aMatch) {
        let iResult = 0;
        let length = aMatch.length;
        for (let i = 0; i < length; ++i) {
            if (aMatch[i]) {
                ++iResult;
            }
        }
        return iResult;
    }
}