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

});