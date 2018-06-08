import GitHubFileDownloader from "./background/GitHubFileDownloader";
import GitLabFileDownloader from "./background/GitLabFileDownloader";
import CreateProperties = chrome.contextMenus.CreateProperties;
import getStorageValues from "./helper";
import OnClickData = chrome.contextMenus.OnClickData;

let contextMenuSaveAs;
let contextMenuDownload;

let githubUrlPatterns;
let gitlabUrlPatterns;
let contextMenu;


chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.urls) {
        githubUrlPatterns = changes.urls.newValue;
    }
    if (changes.gitlaburls) {
        gitlabUrlPatterns = changes.gitlaburls.newValue;
    }
    if (changes.contextMenu) {
        contextMenu = changes.contextMenu.newValue;
    }
    displayContextMenu();
});

getStorageValues(function(item) {
    githubUrlPatterns = item.urls;
    gitlabUrlPatterns = item.gitlaburls;
    contextMenu = item.contextMenu;
    displayContextMenu();
});

function displayContextMenu() {
    if (contextMenuSaveAs) {
        contextMenuSaveAs.forEach(menu => chrome.contextMenus.remove(menu));
    }

    if (contextMenu.saveas) {
        contextMenuSaveAs = [
            activateContextMenuSaveAs(githubUrlPatterns, GitHubFileDownloader.saveAs),
            activateContextMenuSaveAs(gitlabUrlPatterns, GitLabFileDownloader.saveAs)
        ];
    }

    if (contextMenuDownload) {
        contextMenuDownload.forEach(menu => chrome.contextMenus.remove(menu));
    }

    if (contextMenu.download) {
        contextMenuSaveAs = [
            activateContextMenuDownload(githubUrlPatterns, GitHubFileDownloader.download),
            activateContextMenuDownload(gitlabUrlPatterns, GitLabFileDownloader.download)
        ];
    }
}

function activateContextMenuSaveAs(urls:string[], callback:(info: OnClickData, tab: chrome.tabs.Tab) => void) {
    return chrome.contextMenus.create({
        title: "Save as...",
        documentUrlPatterns: urls,
        contexts: ["link"],
        onclick: callback
    });
}

function activateContextMenuDownload(urls:string[], callback:(info: OnClickData, tab: chrome.tabs.Tab) => void) {
    contextMenuDownload = chrome.contextMenus.create({
        title: "Download",
        documentUrlPatterns: urls,
        contexts: ["link"],
        onclick: callback
    });
}

export default null;