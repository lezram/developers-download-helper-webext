import {container} from "tsyringe";
import {Arg, SubstituteOf} from "@fluffy-spoon/substitute";
import {Mo} from "../test-support/Mo";
import {HtmlOptionsService} from "../../src/service/option/HtmlOptionsService";
import {OptionService} from "../../src/service/OptionService";
import {HtmlDocumentService} from "../../src/service/option/HtmlDocumentService";
import {HtmlStatusService} from "../../src/service/option/HtmlStatusService";

describe("OptionServiceTest", (): void => {

    let testee: OptionService;
    let optionDisplayServiceMock: SubstituteOf<HtmlOptionsService>;
    let htmlStatusServiceMock: SubstituteOf<HtmlStatusService>;
    let htmlDocumentServiceMock: SubstituteOf<HtmlDocumentService>;

    beforeEach((): void => {
        container.reset();

        optionDisplayServiceMock = Mo.injectMock(HtmlOptionsService);
        htmlStatusServiceMock = Mo.injectMock(HtmlStatusService);
        htmlDocumentServiceMock = Mo.injectMock(HtmlDocumentService);

        testee = container.resolve(OptionService);
    });

    test("testShowAndHandleOptions", async (): Promise<void> => {

        await testee.showAndHandleOptions();

        optionDisplayServiceMock.received(1).showOptionsHtml(Arg.any());
    });

    test("testShowAndHandleOptionsFailed", async (): Promise<void> => {
        optionDisplayServiceMock.showOptionsHtml(Arg.any()).throws(new Error("test"));

        await testee.showAndHandleOptions();

        optionDisplayServiceMock.received(1).showOptionsHtml(Arg.any());
        htmlStatusServiceMock.received(1).showStatus(Arg.any(), Arg.any(), Arg.is((value) => Boolean(value)))
        htmlStatusServiceMock.received(0).showStatus(Arg.any(), Arg.any(), Arg.is((value) => value === undefined))

    });

    test("testShowAndHandleOptionsClickSaveSuccess", async (): Promise<void> => {
        htmlDocumentServiceMock.onClick(Arg.any(), Arg.any()).mimicks((id, callback) => {
            callback();
        });

        await testee.showAndHandleOptions();

        optionDisplayServiceMock.received(1).showOptionsHtml(Arg.any());
        optionDisplayServiceMock.received(1).saveUpdatedOptions(Arg.any());
        htmlStatusServiceMock.received(1).showStatus(Arg.any(), Arg.any(), Arg.is((value) => value === undefined))
    });

    test("testShowAndHandleOptionsClickSaveFailed", async (): Promise<void> => {
        optionDisplayServiceMock.saveUpdatedOptions(Arg.any()).throws(new Error("test"));

        htmlDocumentServiceMock.onClick(Arg.any(), Arg.any()).mimicks((id, callback) => {
            callback();
        });

        await testee.showAndHandleOptions();

        optionDisplayServiceMock.received(1).showOptionsHtml(Arg.any());
        optionDisplayServiceMock.received(1).saveUpdatedOptions(Arg.any());
        htmlStatusServiceMock.received(1).showStatus(Arg.any(), Arg.any(), Arg.is((value) => Boolean(value)))
        htmlStatusServiceMock.received(0).showStatus(Arg.any(), Arg.any(), Arg.is((value) => value === undefined))
    });
});