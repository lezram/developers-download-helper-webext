export class Util {
    public static isNotNull(value: any) {
        return undefined !== value && null !== value;
    }

    public static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static areArraysEqual(array1: string[], array2: string[]) {
        const isSame = (array1.length == array2.length) && array1.every(function (element, index) {
            return element === array2[index];
        });

        return isSame;
    }

    public static isUrlPatternValid(url): boolean {
        let regexScheme = "(\\*|http|https|file|ftp)";
        let regexHost = "(\\*|(?:\\*\\.)?(?:[^/*]+))?";
        let regexPath = "(.*)";
        let regex = new RegExp("^" + regexScheme + "://" + regexHost + "/" + regexPath + "$");
        let match = regex.exec(url);

        if (!match) {
            return false;
        }

        let scheme = match[1];
        let host = match[2];
        // path = match[3];

        return !(!host && scheme !== 'file');
    }

}