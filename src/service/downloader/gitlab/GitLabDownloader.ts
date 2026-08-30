import { Downloader } from "../Downloader";
import { FileType, FileWrapper } from "../../../model/FileWrapper";
import { ActionData } from "../../../model/ActionData";
import { singleton } from "tsyringe";
import ZIP = require("jszip");
import { DownloaderMetadata } from "../../../model/DownloaderMetadata";
import { ResourceNotAccessibleException } from "../../../exception/ResourceNotAccessibleException";
import { Util } from "../../../util/Util";

@singleton()
export class GitLabDownloader implements Downloader {
    public static readonly ID = "gl";
    private static readonly MANIFEST_PERMISSIONS = ["https://gitlab.com/*"];

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

        if (file.absolutefilename === "") {
            return {
                type: FileType.URL,
                name: "archive.zip",
                content: GitLabDownloader.getRepositoryArchiveUrl(file),
            };
        }


        switch (file.type) {
            case 'tree':
                try {
                    return GitLabDownloader.downloadZip(file);
                } catch (error) {
                    throw new ResourceNotAccessibleException("Request resource failed", error);
                }
            case 'blob':
                try {
                    return GitLabDownloader.downloadFile(file);
                } catch (error) {
                    throw new ResourceNotAccessibleException("Request resource failed", error);
                }
            default:
                throw new Error("Unsupported file");
        }

    }

    public getMetadata(): DownloaderMetadata {
        return {
            id: GitLabDownloader.ID,
            name: "GitLab",
            configuration: {
                linkPatterns: ["https://gitlab.com/*/*"],
                permissions: [...GitLabDownloader.MANIFEST_PERMISSIONS]
            },
            allowCustomUrls: true,
        };
    }

    private static async downloadFile(file) {
        const sha = await GitLabDownloader.fetchFileHash(file);

        let filename = file.filename;
        if (filename) {
            filename = filename.replace(/^[.]+/g, "");
        }

        const blobFile = await fetch(GitLabDownloader.getBlobUrl(file, sha), { credentials: 'include' });
        const theFile = await blobFile.blob();

        return {
            type: FileType.RAW,
            name: filename,
            content: theFile,
        }
    }

    private static async downloadZip(file) {
        const tree = await GitLabDownloader.fetchTree(file);
        const blobs = GitLabDownloader.fetchBlobs(file, tree);
        const folderPathLength = file.absolutefilename ? file.absolutefilename.length + 1 : 1;

        const blob = await GitLabDownloader.createZip(blobs, folderPathLength);

        return {
            type: FileType.URL,
            name: file.filename.replace(/^\./, "") + ".zip",
            content: await Util.createDownloadUrl(blob),
        }
    }

    private static async fetchFileHash(file): Promise<string> {
        let url = `${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/tree?path=${encodeURIComponent(file.path)}&per_page=100`;
        if (file.branch) {
            url += `&ref=${encodeURIComponent(file.branch)}`;
        }

        const tree = await (await fetch(url, { credentials: 'include' })).json();

        return tree.filter(f => f.name === file.filename)[0].id;
    }

    // FIXME: fails silently when the tree has more than 100 elements
    private static async fetchTree(file) {
        let url = `${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/tree?recursive=true&per_page=100`;
        if (file.branch) {
            url += `&ref=${encodeURIComponent(file.branch)}`;
        }
        if (file.absolutefilename) {
            url += `&path=${encodeURIComponent(file.absolutefilename)}`;
        }

        return (await fetch(url, { credentials: 'include' })).json();
    }

    private static fetchBlobs(file, tree) {
        return tree
            .filter(object => object.type == 'blob')
            .map((object) => {
                return {
                    content: fetch(GitLabDownloader.getBlobUrl(file, object.id), { credentials: 'include' })
                        .then(res => res.blob()),
                    ...object
                };
            });
    }

    private static async createZip(blobs, folderPathLength: number): Promise<Blob> {
        const zip = new ZIP();
        for (const blob of blobs) {
            const relativeName = blob.path.substr(folderPathLength);
            zip.file(relativeName, await blob.content);
        }

        const options: ZIP.JSZipGeneratorOptions<'blob'> = {
            type: "blob",
            mimeType: "application/zip"
        };

        return zip.generateAsync(options);
    }

    private static getRepositoryArchiveUrl(file): string {
        return `${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/archive.zip`;
    }

    private static getBlobUrl(file, sha: string): string {
        return `${file.origin}/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/blobs/${sha}/raw`;
    }
}