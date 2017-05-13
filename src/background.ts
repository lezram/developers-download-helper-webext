import FileDownlaoder from "./background/FileDownloader";
import CreateProperties = chrome.contextMenus.CreateProperties;
import getStorageValues from "./helper";

let contextMenuSaveAs;
let contextMenuDownload;

let urlPatterns;
let contextMenu;


chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.urls) {
        urlPatterns = changes.urls.newValue;
    }
    if (changes.contextMenu) {
        contextMenu = changes.contextMenu.newValue;
    }
    displayContextMenu();
});

getStorageValues(function(item) {
    urlPatterns = item.urls;
    contextMenu = item.contextMenu;
    displayContextMenu();
});

function displayContextMenu() {
    if (contextMenuSaveAs) {
        chrome.contextMenus.remove(contextMenuSaveAs);
    }

    if (contextMenu.saveas) {
        activateContextMenuSaveAs(urlPatterns);
    }

    if (contextMenuDownload) {
        chrome.contextMenus.remove(contextMenuDownload);
    }

    if (contextMenu.download) {
        activateContextMenuDownload(urlPatterns);
    }
}

function activateContextMenuSaveAs(urls:string[]) {
    contextMenuSaveAs = chrome.contextMenus.create({
        title: "Save as...",
        documentUrlPatterns: urls,
        contexts: ["link"],
        onclick: FileDownlaoder.saveAs
    });
}

function activateContextMenuDownload(urls:string[]) {
    contextMenuDownload = chrome.contextMenus.create({
        title: "Download",
        documentUrlPatterns: urls,
        contexts: ["link"],
        onclick: FileDownlaoder.download
    });
}

export default null;