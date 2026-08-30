import {Util} from "../../src/util/Util";

describe("UtilTest", () => {

    test("testIsNotNull", async () => {
        const result = Util.isNotNull("test");

        expect(result).toBeTruthy();
    });

    test("testIsNotNullEmptyString", async () => {
        const result = Util.isNotNull("");

        expect(result).toBeTruthy();
    });

    test("testIsNotNullIsNull", async () => {
        const result = Util.isNotNull(null);

        expect(result).toBeFalsy();
    });

    test("testIsNotNullIsUndefined", async () => {
        const result = Util.isNotNull(undefined);

        expect(result).toBeFalsy();
    });

    test("testIsNull", async () => {
        const result = Util.isNull("test");

        expect(result).toBeFalsy();
    });

    test("testIsNotNullEmptyString", async () => {
        const result = Util.isNull("");

        expect(result).toBeFalsy();
    });

    test("testIsNotNullIsNull", async () => {
        const result = Util.isNull(null);

        expect(result).toBeTruthy();
    });

    test("testIsNotNullIsUndefined", async () => {
        const result = Util.isNull(undefined);

        expect(result).toBeTruthy();
    });

    test("testSleep", async () => {

        const start = Date.now();
        await Util.sleep(1000);
        const duration = Date.now() - start;

        expect(duration).toBeGreaterThanOrEqual(1000);
    });

    test("testIsUrlMatchPatternValid", async () => {
        let isValid = Util.isUrlMatchPatternValid("http://test.de/*");

        expect(isValid).toBeTruthy();
    });

    test("testIsUrlMatchPatternValid", async () => {
        let isValid = Util.isUrlMatchPatternValid("http://test.de/*");

        expect(isValid).toBeTruthy();
    });

    test("testIsUrlMatchPatternValidWithoutAsterisks", async () => {
        let isValid = Util.isUrlMatchPatternValid("http://test.de/");

        expect(isValid).toBeFalsy();
    });

    test("testIsUrlMatchPatternValidInvalidUrl", async () => {
        let isValid = Util.isUrlMatchPatternValid("testabsc");

        expect(isValid).toBeFalsy();
    });

    test("testIsUrlMatchPatternValidOnlyAsterisks", async () => {
        let isValid = Util.isUrlMatchPatternValid("*://*/*");

        expect(isValid).toBeTruthy();
    });

    test("testIsUrlMatchPatternValidFilePattern", async () => {
        let isValid = Util.isUrlMatchPatternValid("file:///*");
        expect(isValid).toBeFalsy();
    });

    test("testToSubdomainUrlMatchPattern", async () => {
        let pattern = Util.toSubdomainUrlMatchPattern("https://github.my.com/*");

        expect(pattern).toEqual("https://*.github.my.com/*");
    });

    test("testToSubdomainUrlMatchPatternKeepsPath", async () => {
        let pattern = Util.toSubdomainUrlMatchPattern("https://github.my.com/user/*");

        expect(pattern).toEqual("https://*.github.my.com/user/*");
    });

    test("testToSubdomainUrlMatchPatternAlreadyWithSubdomains", async () => {
        let pattern = Util.toSubdomainUrlMatchPattern("https://*.github.my.com/*");

        expect(pattern).toBeNull();
    });

    test("testToSubdomainUrlMatchPatternWithoutFixedHost", async () => {
        let pattern = Util.toSubdomainUrlMatchPattern("*://*/*");

        expect(pattern).toBeNull();
    });

    test("testToSubdomainUrlMatchPatternInvalidUrl", async () => {
        let pattern = Util.toSubdomainUrlMatchPattern("testabsc");

        expect(pattern).toBeNull();
    });

    test("testConvertBlobToDataUri", async () => {
        const blob = new Blob(["abcdefg"], {type: "application/zip"});

        const dataUri = await Util.convertBlobToDataUri(blob);

        expect(dataUri).toBe("data:application/zip;base64," + Buffer.from("abcdefg").toString("base64"));
    });

    test("testConvertBlobToDataUriWithoutType", async () => {
        const blob = new Blob(["abcdefg"]);

        const dataUri = await Util.convertBlobToDataUri(blob);

        expect(dataUri).toBe("data:application/octet-stream;base64," + Buffer.from("abcdefg").toString("base64"));
    });

    test("testConvertDataUriToBlobAndBack", async () => {
        const dataUri = await Util.convertBlobToDataUri(new Blob(["abcdefg"], {type: "application/zip"}));

        const dataUriOfBlob = await Util.convertBlobToDataUri(Util.convertDataUriToBlob(dataUri));

        expect(dataUriOfBlob).toBe(dataUri);
    });

    test("testCreateDownloadUrlWithObjectUrlSupport", async () => {
        const createObjectURL = global.URL.createObjectURL;
        global.URL.createObjectURL = jest.fn().mockReturnValue("blob:test");

        try {
            const url = await Util.createDownloadUrl(new Blob(["abcdefg"]));

            expect(url).toBe("blob:test");
        } finally {
            global.URL.createObjectURL = createObjectURL;
        }
    });

    test("testCreateDownloadUrlWithoutObjectUrlSupport", async () => {
        const createObjectURL = global.URL.createObjectURL;
        global.URL.createObjectURL = undefined;

        try {
            const url = await Util.createDownloadUrl(new Blob(["abcdefg"]));

            expect(url).toBe("data:application/octet-stream;base64," + Buffer.from("abcdefg").toString("base64"));
        } finally {
            global.URL.createObjectURL = createObjectURL;
        }
    });
});
