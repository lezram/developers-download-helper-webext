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

        let scheme = match[1];
        let host = match[2];
        // path = match[3];

        return !(!host && scheme !== 'file');
    }

}