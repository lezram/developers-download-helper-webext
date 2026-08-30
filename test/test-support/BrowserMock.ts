export const action = {
    onClicked: {
        addListener: jest.fn()
    }
};

export const contextMenus = {
    create: jest.fn(),
    removeAll: jest.fn(),
    onClicked: {
        addListener: jest.fn()
    }
};

export const downloads = {
    download: jest.fn()
};

export const notifications = {
    create: jest.fn(),
    update: jest.fn(),
    clear: jest.fn()
};

export const permissions = {
    request: jest.fn(),
    getAll: jest.fn(),
    remove: jest.fn()
};

export const runtime = {
    getManifest: jest.fn(),
    getURL: jest.fn(),
    openOptionsPage: jest.fn()
};

export const storage = {
    sync: {
        get: jest.fn(),
        set: jest.fn(),
        clear: jest.fn()
    },
    onChanged: {
        addListener: jest.fn()
    }
};
