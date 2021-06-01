# Developer's Download Helper - Web Extension
Web extension to download files and folders from online file browsers via context menu.

## Supported sites
* :octocat: GitHub
* 🦊 GitLab

## Installation
* [Google Chrome Webstore](https://chrome.google.com/webstore/detail/github-download-helper/apchbjkblfhmkohghpnhidldebmpmjnn)
* [Firefox Add-Ons](https://addons.mozilla.org/en-US/firefox/addon/developers-download-helper/)

Download zip from the [latest release](https://github.com/lezram/developers-download-helper-webext/releases/latest) and import it in your browser.

## Usage
### Options
In the extension option/preferences you can specify the urls on which the extension should be enabled.

## Build
To build the extension run
```sh
npm run build
```

### Extension files
For firefox, ...
```sh
npm run build:zip
```

For chromium
```sh
npm run build:crx
```



## Thanks to ...
* [JSZip](https://github.com/Stuk/jszip)
* [Typescript](https://github.com/microsoft/TypeScript)
* [tsyringe](https://github.com/microsoft/tsyringe)
* [webpack](https://github.com/webpack/webpack)
* [WebExt API](https://github.com/Lusito/webextension-polyfill-ts)
