function getStorageValues(fn: Function){
    chrome.storage.sync.get({
        urls: ["https://github.com/*"],
        contextMenu: {
            saveas: true,
            download: false
        }
    }, items => {
        fn(items);
    });
}

export default getStorageValues;
