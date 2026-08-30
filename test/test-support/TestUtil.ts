export class TestUtil {
    private static originalCreateObjectURL = global.URL.createObjectURL;
    private static originalBlob = global["Blob"];

    public static randomString(length = 15) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    public static mockJsBrowserFunctions() {
        global.URL.createObjectURL = jest.fn();
        global["Blob"] = jest.fn();
    }

    public static simulateServiceWorkerWithoutObjectUrl() {
        global.URL.createObjectURL = undefined;
    }

    public static restoreJsBrowserFunctions() {
        global.URL.createObjectURL = TestUtil.originalCreateObjectURL;
        global["Blob"] = TestUtil.originalBlob;
    }
}
