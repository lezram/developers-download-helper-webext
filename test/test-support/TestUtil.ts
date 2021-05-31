export class TestUtil {
    public static randomString(length = 15) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    public static mockJsBrowserFunctions(){
        global.URL.createObjectURL = jest.fn();
        global["Blob"] = jest.fn();
    }
}
