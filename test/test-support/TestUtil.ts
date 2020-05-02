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

    public static initializeChromeContext() {
        global["Blob"] = jest.fn();
        global["URL"] = {
            createObjectURL: jest.fn()
        }

        const chrome = {
            contextMenus: {
                create: jest.fn(),
                removeAll: jest.fn().mockImplementation((callback?: () => void) => {
                    callback();
                })
            },
            downloads: {
                download: jest.fn().mockImplementation((any, callback?: () => void) => {
                    callback();
                })
            },
            notifications: {
                create: jest.fn(),
                update: jest.fn(),
                clear: jest.fn()
            },
            permissions: {
                request: jest.fn().mockImplementation((any, callback?: () => void) => {
                    callback();
                })
            },
            storage: {
                sync: {
                    get: jest.fn().mockImplementation((any, callback?: () => void) => {
                        callback();
                    }),
                    set: jest.fn().mockImplementation((any, callback?: () => void) => {
                        callback();
                    }),
                    clear: jest.fn().mockImplementation((callback?: () => void) => {
                        callback();
                    })
                },
                onChanged: {
                    addListener: jest.fn().mockImplementation((callback?: () => void) => {
                        callback();
                    })
                }
            },
            runtime: {
                lastError: false,
                getManifest: jest.fn()
            }
        }

        global["chrome"] = chrome;

        return chrome;
    }

}