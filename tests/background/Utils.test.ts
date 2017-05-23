import {expect} from 'chai';
import {Utils} from "../../src/background/Utils";
import 'mocha';


describe('mustache()', () => {
    it('should replace mustaches', () => {
        let data: string = "etst{replace}123{asds";
        let expected: string = "etstREPLACED123{asds";

        let result = Utils.mustache(data, {"replace": "REPLACED"});
        expect(result).to.equal(expected);
    });

    it('should replace mustaches', () => {
        let data: string = "etst{{replace}}123{asds";
        let expected: string = "etst{REPLACED}123{asds";

        let result = Utils.mustache(data, {"replace": "REPLACED"});
        expect(result).to.equal(expected);
    });

    it('replace nothing', () => {
        let data: string = "etst{replace}123{asds";

        let result = Utils.mustache(data, null);
        expect(result).to.equal(data);
    });
});


describe('getFirstKey()', () => {
    it('should return the getFirstKey element', () => {
        let data: Object = {
            "test/": "data",
            "bved": 2,
            "asd": 3
        };

        let result = Utils.getFirstKey(data);
        expect(result).to.equal("test/");
    });

    it('return null', () => {
        let result = Utils.getFirstKey({});
        expect(result).to.equal(null);
    });
});


describe('getMatchLength()', () => {
    it('length of filled fields', () => {
        let data: string[] = [
            "a",
            "b",
            "c",
            undefined,
            null
        ];

        let result: number = Utils.getMatchLength(data);
        expect(result).to.equal(3);
    });

    it('length with null', () => {
        let result: number = Utils.getMatchLength(null);
        expect(result).to.equal(0);
    });

    it('length of empty array', () => {
        let result: number = Utils.getMatchLength([]);
        expect(result).to.equal(0);
    });
});
