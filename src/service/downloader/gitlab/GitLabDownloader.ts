import {Downloader} from "../Downloader";
import {DownloaderMetadata} from "../../../model/Configuration";
import {FileType, FileWrapper} from "../../../model/FileWrapper";
import {ActionData} from "../../../model/ActionData";
import {singleton} from "tsyringe";
import * as ZIP from "jszip";

@singleton()
export class GitLabDownloader implements Downloader {
    public static readonly ID = "gl";

    public async getFile(data: ActionData): Promise<FileWrapper> {
        const url = data.url;
        const parts = url.pathname.substr(1).split("/");

        if (parts[2] == "-") {
            parts.splice(2, 1);
        }

        const file = {
            origin: url.origin,
            reponame: parts.slice(0, 2).join("/"),
            type: parts[2],
            branch: parts[3],
            absolutefilename: parts.slice(4).join("/"),
            filename: parts.length > 3 ? parts[parts.length - 1] : "",
            path: parts.slice(4, parts.length - 1).join("/")
        };

        console.log("download", file);

        if (file.absolutefilename === "") {
            // https://gitlab.com/gitlab-com/support-forum/issues/3067
            return {
                type: FileType.URL,
                name: "archive.zip",
                content: `${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/archive.zip`,
            };
        }

        switch (file.type) {
            case 'tree':
                const blob = await GitLabDownloader.download_zip(file);
                console.log(blob);
                return blob;
            case 'blob':
                return GitLabDownloader.download_file(file);
            default:
                throw new Error("Unsupported file");
        }
    }

    public getMetadata(): DownloaderMetadata {
        return {
            id: GitLabDownloader.ID,
            name: "GitLab",
            urlPatterns: [
                "https://gitlab.com/*"
            ]
        };
    }

    private static async download_file(file) {
        // find hash of file
        let url = `${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/tree?path=${encodeURIComponent(file.path)}&per_page=100`;
        if (file.branch) {
            url += `&ref=${encodeURIComponent(file.branch)}`;
        }
        let tree = await (await fetch(url, {credentials: 'include'})).json();
        let sha = tree.filter(f => f.name === file.filename)[0].id;

        let filename = file.filename;
        if (filename) {
            filename = filename.replace(/^[.]+/g, "");
        }

        const blobFile = await fetch(`${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/blobs/${sha}/raw`, {credentials: 'include'});
        const theFile = await blobFile.blob();

        return {
            type: FileType.RAW,
            name: filename,
            content: theFile,
        }
    }

    private static async download_zip(file) {
        // get tree
        // FIXME: fails silently when tree has more than 100 elements
        let url = `${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/tree?recursive=true&per_page=100`;
        if (file.branch) {
            url += `&ref=${encodeURIComponent(file.branch)}`;
        }
        let offset = 1;
        if (file.absolutefilename) {
            url += `&path=${encodeURIComponent(file.absolutefilename)}`;
            offset += file.absolutefilename.length;
        }

        let data = await (await fetch(url, {credentials: 'include'})).json();

        // download files
        let blobs = data
            .filter(object => object.type == 'blob')
            .map((object) => {
                return {
                    content: fetch(`${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/blobs/${object.id}/raw`, {credentials: 'include'})
                        .then(res => res.blob()),
                    ...object
                };
            });

        // create zip file
        let zip = new ZIP();
        for (const blob of blobs) {
            let relativeName = blob.path.substr(offset);
            zip.file(relativeName, await blob.content);
        }

        let options: ZIP.JSZipGeneratorOptions = {
            type: "blob",
            mimeType: "application/zip"
        };
        let blob = await zip.generateAsync(options);


        return {
            type: FileType.URL,
            name: file.filename.replace(/^\./, "") + ".zip",
            content: URL.createObjectURL(blob),
        }
    }
}