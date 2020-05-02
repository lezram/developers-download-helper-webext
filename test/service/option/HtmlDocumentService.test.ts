/**
 * @jest-environment jsdom
 */
import {container} from "tsyringe";
import {HtmlDocumentService} from "../../../src/service/option/HtmlDocumentService";
import {HtmlElementNotFoundException} from "../../../src/exception/HtmlElementNotFoundException";
import {IllegalArgumentException} from "../../../src/exception/IllegalArgumentException";

describe("HtmlDocumentServiceTest", (): void => {

    let testee: HtmlDocumentService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(HtmlDocumentService);
    });

    test("testGetElement", (): void => {
        const id = 'test';
        document.body.innerHTML = `<div id="${id}"></div>`;

        let element = testee.getElement(id);

        expect(element.id).toBe(id);
    });

    test("testGetElementNotFound", (): void => {
        document.body.innerHTML = `<div id="abc"></div>`;

        const getElement = (): void => {
            testee.getElement("def");
        }

        expect(getElement).toThrowError(HtmlElementNotFoundException);
    });

    test("testGetElementDocumentNotExisting", (): void => {

        // @ts-ignore
        testee["htmlDocument"] = null;

        const getElement = (): void => {
            testee.getElement("def");
        }

        expect(getElement).toThrowError(IllegalArgumentException);
    });


    test("testOnClick", (): void => {
        const id = 'abc';
        document.body.innerHTML = `<button id="${id}"></button>`;

        const fn = jest.fn();

        testee.onClick(id, async (): Promise<void> => {
            fn();
        });
        document.getElementById(id).click();

        expect(fn).toBeCalledTimes(1);
    });

    test("testOnClickElementNotExisting", (): void => {
        const id = 'notexisting';
        document.body.innerHTML = `<button></button>`;

        const fn = jest.fn();

        const addOnClickEvent = (): void => {
            testee.onClick(id, async (): Promise<void> => {
                fn();
            });
        }

        expect(addOnClickEvent).toThrowError(HtmlElementNotFoundException);
    });

});