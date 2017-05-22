import {expect} from 'chai';
import 'mocha';
import {UrlBuilder} from "../../src/background/UrlBuilder";
import domInit from "../DomTestHelper";


describe('UrlBuilder()', () => {
    domInit();

    it('with path', () => {
        let url = new UrlBuilder("http://test.de/123").slash("test").build();

        expect("http://test.de/123/test").to.equal(url);
    });

    it('with path and trailing slash', () => {
        let url = new UrlBuilder("http://test.de/123").slash("test").slash("").build();

        expect("http://test.de/123/test").to.equal(url);
    });

    it('with path by HTMLAnchorElement', () => {
        let link = <HTMLAnchorElement> document.createElement('a');
        link.href = "http://test.de/";
        let url = new UrlBuilder(link).slash("test").build();

        expect("http://test.de/test").to.equal(url);
    });

    it('with path by string', () => {
        let url = new UrlBuilder("http://test.de/123").removePath().slash("test").build();

        expect("http://test.de/test").to.equal(url);
    });

    it('with subdomain', () => {
        let url = new UrlBuilder("http://test.de/123").addSubdomain("api").build();

        expect("http://api.test.de/123").to.equal(url);
    });

    it('with query', () => {
        let url = new UrlBuilder("http://test.de/123").slash("master").addQuery("ref","test").addQuery("a","b").build();

        expect("http://test.de/123/master?ref=test&a=b").to.equal(url);
    });

});