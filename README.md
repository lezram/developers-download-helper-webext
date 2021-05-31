# Developer's Download Helper - Web Extension
Web extension to download files and folders from online file browsers via context menu.

## Supported sites
* GitHub
* GitLab

## Tested browsers
* Chrome
* Firefox

## Usage
[Download from Google Chrome Webstore](https://chrome.google.com/webstore/detail/github-download-helper/apchbjkblfhmkohghpnhidldebmpmjnn)

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
