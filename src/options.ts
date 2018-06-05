import getStorageValues from "./helper";

function isPatternValid(url){
    let regexScheme = "(\\*|http|https|file|ftp)";
    let regexHost = "(\\*|(?:\\*\\.)?(?:[^/*]+))?";
    let regexPath = "(.*)";
    let regex = new RegExp("^" + regexScheme + "://" + regexHost + "/" + regexPath + "$");
    let match = regex.exec(url);

    if (!match){
        return false;
    }

    let scheme = match[1];
    let host = match[2];
    let path = match[3];

    if (!host && scheme !== 'file'){
        return false;
    }

    return true;
}

function get_valid_urls(prefix: string) {
    let urls = (<HTMLInputElement> document.getElementById(prefix + 'urls')).value;
    let aUrls = urls.replace(" ","").split(",");

    let aUrlsToSave = [];
    for(let index in aUrls){
        if(!isPatternValid(aUrls[index])){
            let status = <HTMLInputElement> document.getElementById('status');
            status.textContent = 'Invalid Pattern: '+aUrls[index];
        }
        else {
            aUrlsToSave.push(aUrls[index]);
        }
    }
    return aUrlsToSave;
}

function save_options() {
    let githubUrls = get_valid_urls('');
    let gitlabUrls = get_valid_urls('gitlab');

    let checkboxSaveAs = (<HTMLInputElement> document.getElementById('saveas')).checked;
    let checkboxDownload = (<HTMLInputElement> document.getElementById('download')).checked;

    chrome.storage.sync.set({
        urls: githubUrls,
        gitlaburls: gitlabUrls,
        contextMenu: {
            saveas: checkboxSaveAs,
            download: checkboxDownload
        }
    }, function() {
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    getStorageValues(function(items) {
        (<HTMLInputElement> document.getElementById('urls')).value = items.urls.toString();
        (<HTMLInputElement> document.getElementById('gitlaburls')).value = items.gitlaburls.toString();
        (<HTMLInputElement> document.getElementById('saveas')).checked = items.contextMenu.saveas;
        (<HTMLInputElement> document.getElementById('download')).checked  = items.contextMenu.download;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

export default null;