import OnClickData = chrome.contextMenus.OnClickData;
import NotificationHelper from "./NotificationHelper";
import * as ZIP from "jszip";

export default class GitLabFileDownloader {

    public static saveAs(info: OnClickData, tab: chrome.tabs.Tab) {
        GitLabFileDownloader.download(info, tab, true);
    }
    
    public static download(info: OnClickData, tab: chrome.tabs.Tab, showSaveAs = false) {
        if (!info || !info.linkUrl) {
            return;
        }
        
        let parts = new URL(info.linkUrl).pathname.substr(1).split("/");
        const file = {
            reponame: parts.slice(0,2).join("/"),
            type: parts[2],
            branch: parts[3],
            absolutefilename: parts.slice(4).join("/"),
            filename: parts.length > 3 ? parts[parts.length - 1] : "",
            path: parts.slice(4, parts.length - 1).join("/")
        };
        
        if(file.absolutefilename === "") {
            // https://gitlab.com/gitlab-com/support-forum/issues/3067
            chrome.downloads.download({
                url: `https://gitlab.com/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/archive.zip`,
                saveAs: showSaveAs
            });
            
            return;
        }
        
        switch(file.type) {
            case 'tree':
                GitLabFileDownloader.download_zip(file, showSaveAs);
                break;
            case 'blob':
                GitLabFileDownloader.download_file(file, showSaveAs);
                break;
            default:
                alert("Sorry something went wrong");
        }
    }
    
    
    private static async download_file(file, showSaveAs) {
        // find hash of file
        let url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/tree?path=${encodeURIComponent(file.path)}&per_page=100`;
        if(file.branch) {
            url += `&ref=${encodeURIComponent(file.branch)}`;
        }
        let tree = await (await fetch(url, {credentials: 'include'})).json();
        let sha = tree.filter( f => f.name === file.filename )[0].id;
        
        // download
        chrome.downloads.download({
            filename: file.filename,
            url: `https://gitlab.com/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/blobs/${sha}/raw`,
            saveAs: showSaveAs
        });
    }
    
    private static async download_zip(file, showSaveAs) {
        // get tree
        // FIXME: fails silently when tree has more than 100 elements
        let url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/tree?recursive=true&per_page=100`;
        if(file.branch) {
            url += `&ref=${encodeURIComponent(file.branch)}`;
        }
        let offset = 1;
        if(file.absolutefilename) {
            url += `&path=${encodeURIComponent(file.absolutefilename)}`;
            offset += file.absolutefilename.length;
        }
        
        let data = await (await fetch(url, {credentials: 'include'})).json();
        
        // download files
        let blobs = data
            .filter(object => object.type == 'blob')
            .map(object => {
                return {
                    content: fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(file.reponame)}/repository/blobs/${object.id}/raw`, {credentials: 'include'})
                                .then(res => res.blob()),
                    ...object
                };
            });
        
        // create zip file
        let zip = new ZIP();
        let promises = blobs.map( object => {
            let relativeName = object.path.substr(offset);
            return object.content.then(content => {
                console.log(`adding ${relativeName}`);
                return zip.file(relativeName, content);
            });
        });
        let options = {
            type: "blob",
            mimeType: "application/zip"
        };
        Promise.all(promises)
            .then( _ => zip.generateAsync(options) )
            .then( blob => {
                chrome.downloads.download({
                    filename: file.filename + ".zip",
                    url: URL.createObjectURL(blob),
                    saveAs: showSaveAs
                });
            });
    }
}