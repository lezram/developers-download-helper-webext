jest.mock("webextension-polyfill", () => require("./test-support/BrowserMock"));

beforeEach((): void => {
    jest.resetAllMocks();
});
