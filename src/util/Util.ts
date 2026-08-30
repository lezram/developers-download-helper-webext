export class Util {
    private static readonly SUBDOMAIN_WILDCARD = "*.";
    private static readonly FROM_CHAR_CODE_ARGUMENT_LIMIT = 0x8000;

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

        const host = match[2];

        return Boolean(host);
    }

    public static toSubdomainUrlMatchPattern(url: string): string {
        let regex = new RegExp("^(\\*|http|https|file|ftp)://((?:\\*\\.)?[^/*]+)/(.*)$");
        let match = regex.exec(url || "");

        if (!match) {
            return null;
        }

        const [, scheme, host, path] = match;

        if (host.startsWith(Util.SUBDOMAIN_WILDCARD)) {
            return null;
        }

        return scheme + "://" + Util.SUBDOMAIN_WILDCARD + host + "/" + path;
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

    public static async convertBlobToDataUri(blob: Blob): Promise<string> {
        const data = new Uint8Array(await blob.arrayBuffer());

        let binary = "";
        for (let offset = 0; offset < data.length; offset += Util.FROM_CHAR_CODE_ARGUMENT_LIMIT) {
            binary += String.fromCharCode.apply(null,
                data.subarray(offset, offset + Util.FROM_CHAR_CODE_ARGUMENT_LIMIT));
        }

        return `data:${blob.type || "application/octet-stream"};base64,${btoa(binary)}`;
    }

    public static isObjectUrlSupported(): boolean {
        return typeof URL !== "undefined" && typeof URL.createObjectURL === "function";
    }

    public static async createDownloadUrl(blob: Blob): Promise<string> {
        if (Util.isObjectUrlSupported()) {
            return URL.createObjectURL(blob);
        }

        return Util.convertBlobToDataUri(blob);
    }

}
