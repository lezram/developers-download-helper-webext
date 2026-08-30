import GithubURL from "../../../../src/service/downloader/github/GithubURL";
import {FileType} from "../../../../src/service/downloader/github/FileType";

describe("GithubURLTest", (): void => {
    const REPO_URL = "https://github.com/user/repo";

    test("testParseFileUrl", (): void => {
        const testee = new GithubURL(REPO_URL + "/blob/master/src/util/Util.ts");

        expect(testee.user).toBe("user");
        expect(testee.repository).toBe("repo");
        expect(testee.fileType).toBe(FileType.BLOB);
        expect(testee.branch).toBe("master");
        expect(testee.filePath).toBe("src/util/Util.ts");
    });

    test("testParseFolderUrl", (): void => {
        const testee = new GithubURL(REPO_URL + "/tree/master/src/util");

        expect(testee.fileType).toBe(FileType.TREE);
        expect(testee.branch).toBe("master");
        expect(testee.filePath).toBe("src/util");
    });

    test("testParseRepositoryUrl", (): void => {
        const testee = new GithubURL(REPO_URL);

        expect(testee.fileType).toBe(FileType.ZIPBALL);
        expect(testee.branch).toBeNull();
        expect(testee.filePath).toBeNull();
    });

    test("testInvalidUrl", (): void => {
        expect((): GithubURL => new GithubURL("https://github.com/user")).toThrow();
    });

    test("testGetApiUrl", (): void => {
        const testee = new GithubURL(REPO_URL + "/tree/master/src/util");

        expect((<any>testee).getApiUrl())
            .toBe("https://api.github.com/repos/user/repo/contents/src/util?ref=master");
    });

    test("testGetApiUrlForEnterpriseHost", (): void => {
        const testee = new GithubURL("https://github.enterprise.com/user/repo/blob/master/README.md");

        expect((<any>testee).getApiUrl())
            .toBe("https://github.enterprise.com/api/v3/repos/user/repo/contents/README.md?ref=master");
    });

    test("testGetFallbackDownloadUrlForFile", (): void => {
        const testee = new GithubURL(REPO_URL + "/blob/master/src/util/Util.ts");

        expect((<any>testee).getFallbackDownloadUrl())
            .toBe(REPO_URL + "/raw/master/src/util/Util.ts");
    });

    test("testGetFallbackDownloadUrlForFolderIsRepositoryZipball", (): void => {
        const testee = new GithubURL(REPO_URL + "/tree/master/src/util");

        expect((<any>testee).getFallbackDownloadUrl())
            .toBe(REPO_URL + "/zipball/master");
    });

    test("testGetFallbackDownloadUrlForRepository", (): void => {
        const testee = new GithubURL(REPO_URL);

        expect((<any>testee).getFallbackDownloadUrl())
            .toBe(REPO_URL + "/zipball/master");
    });
});
