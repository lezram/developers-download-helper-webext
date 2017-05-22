export class Utils {
    public static mustache(text: string, data: Object) {
        for (let key in data) {
            text = text.replace(new RegExp("{\\s*" + key + "\\s*}", "g"), data[key]);
        }

        return text;
    };

    public static first(object) {
        let keys = Object.keys(object);
        if (keys.length > 0) {
            return keys[0];
        }
        return null;
    }

    public static getMatchLength(aMatch: string[]) {
        if (!aMatch) {
            aMatch = [];
        }

        let iResult = 0;
        let length = aMatch.length;
        for (let i = 0; i < length; ++i) {
            if (aMatch[i]) {
                ++iResult;
            }
        }
        return iResult;
    }

}