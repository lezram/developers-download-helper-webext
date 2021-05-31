export class Util {
    public static isNotNull(value: any) {
        return !Util.isNull(value);
    }

    public static isNull(value: any) {
        return undefined === value || null === value;
    }

    public static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static isUrlMatchPatternValid(url): boolean {
        let regexScheme = "(\\*|http|https|file|ftp)";
        let regexHost = "(\\*|(?:\\*\\.)?(?:[^/*]+))?";
        let regexPath = "(.*)";
        let regex = new RegExp("^" + regexScheme + "://" + regexHost + "/" + regexPath + "$");
        let match = regex.exec(url);

        if (!match || !url.includes("*")) {
            return false;
        }

        // let scheme = match[1];
        let host = match[2];
        // path = match[3];

        return Boolean(host);
    }

    public static convertDataUriToBlob(dataUri: string): Blob {
        const dataUriParts = dataUri.split(',');
        const dataType = dataUriParts[0];
        const encodedData = dataUriParts[1];

        const mimeString = dataType.split(':')[1].split(';')[0]
        const data = atob(encodedData);

        const dataBuffer = new ArrayBuffer(data.length);
        const bufferWrapper = new Uint8Array(dataBuffer);

        for (let i = 0; i < data.length; i++) {
            bufferWrapper[i] = data.charCodeAt(i);
        }

        return new Blob([dataBuffer], {type: mimeString});
    }

}
