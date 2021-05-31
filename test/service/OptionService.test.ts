import {container} from "tsyringe";
import {Arg, SubstituteOf} from "@fluffy-spoon/substitute";
import {Mo} from "../test-support/Mo";
import {HtmlOptionsService} from "../../src/service/option/HtmlOptionsService";
import {OptionService} from "../../src/service/OptionService";
import {HtmlDocumentService} from "../../src/service/option/HtmlDocumentService";
import {HtmlStatusService} from "../../src/service/option/HtmlStatusService";

describe("OptionServiceTest", (): void => {

    let testee: OptionService;
    let htmlOptionsServiceMock: SubstituteOf<HtmlOptionsService>;
    let htmlStatusServiceMock: SubstituteOf<HtmlStatusService>;
    let htmlDocumentServiceMock: SubstituteOf<HtmlDocumentService>;

    let assertOnStatusUpdate: (assert: () => void) => void = (assert: () => void)=>{};

    beforeEach((): void => {
        container.reset();
        htmlOptionsServiceMock = Mo.injectMock(HtmlOptionsService);
        htmlStatusServiceMock = Mo.injectMock(HtmlStatusService);
        htmlDocumentServiceMock = Mo.injectMock(HtmlDocumentService);

        testee = container.resolve(OptionService);

        assertOnStatusUpdate = (assert: () => void) => {
            expect.assertions(1);
            htmlStatusServiceMock.showStatus(Arg.all()).mimicks(() => {
                expect(true).toBeTruthy();

                assert();
            });
            htmlDocumentServiceMock.onClick(Arg.any(), Arg.any()).mimicks((id, callback) => {
                callback();
            });
        }
    });

    test("testShowAndHandleOptions", async (): Promise<void> => {

        await testee.showAndHandleOptions();

        htmlOptionsServiceMock.received(1).showOptionsHtml(Arg.any());
    });

    test("testShowAndHandleOptionsFailed", async (): Promise<void> => {
        assertOnStatusUpdate(() => {
            htmlOptionsServiceMock.received(1).showOptionsHtml(Arg.any());
            htmlStatusServiceMock.received(1).showStatus(Arg.any(), Arg.any(), Arg.is((value) => Boolean(value)))
            htmlStatusServiceMock.received(0).showStatus(Arg.any(), Arg.any(), Arg.is((value) => value === undefined))
        });

        htmlOptionsServiceMock.showOptionsHtml(Arg.any()).throws(new Error("test"));

        await testee.showAndHandleOptions();
    });

    test("testShowAndHandleOptionsClickSaveSuccess", async (): Promise<void> => {
        assertOnStatusUpdate(() => {
            htmlOptionsServiceMock.received(1).showOptionsHtml(Arg.any());
            htmlOptionsServiceMock.received(1).saveUpdatedOptions(Arg.any());
            htmlStatusServiceMock.received(1).showStatus(Arg.any(), Arg.any(), Arg.is((value) => value === undefined));
        });

        htmlOptionsServiceMock.saveUpdatedOptions(Arg.any()).resolves();
        htmlOptionsServiceMock.manageUrlPermissions(Arg.any()).resolves(true);

        await testee.showAndHandleOptions();

    });

    test("testShowAndHandleOptionsClickSaveFailed", async (): Promise<void> => {
        assertOnStatusUpdate(() => {
            htmlOptionsServiceMock.received(1).showOptionsHtml(Arg.any());
            htmlOptionsServiceMock.received(1).saveUpdatedOptions(Arg.any());
            htmlStatusServiceMock.received(1).showStatus(Arg.any(), Arg.any(), Arg.is((value) => Boolean(value)))
            htmlStatusServiceMock.received(0).showStatus(Arg.any(), Arg.any(), Arg.is((value) => value === undefined));
        });

        htmlOptionsServiceMock.saveUpdatedOptions(Arg.any()).throws(new Error("test"));
        htmlOptionsServiceMock.manageUrlPermissions(Arg.any()).resolves(true);

        await testee.showAndHandleOptions();
    });

    test("testShowAndHandleOptionsClickSavePermissionsNotGranted", async (): Promise<void> => {
        assertOnStatusUpdate(() => {
            htmlOptionsServiceMock.received(1).showOptionsHtml(Arg.any());
            htmlOptionsServiceMock.didNotReceive().saveUpdatedOptions(Arg.any());
            htmlStatusServiceMock.received(1).showStatus(Arg.any(), Arg.any(), Arg.is((value) => Boolean(value)))
            htmlStatusServiceMock.didNotReceive().showStatus(Arg.any(), Arg.any(), Arg.is((value) => value === undefined));
        });

        htmlOptionsServiceMock.manageUrlPermissions(Arg.any()).resolves(false);

        await testee.showAndHandleOptions();
    });

    test("testShowAndHandleOptionsClickSavePermissionsFailed", async (): Promise<void> => {
        assertOnStatusUpdate(() => {
            htmlOptionsServiceMock.received(1).showOptionsHtml(Arg.any());
            htmlOptionsServiceMock.didNotReceive().saveUpdatedOptions(Arg.any());
            htmlStatusServiceMock.received(1).showStatus(Arg.any(), Arg.any(), Arg.is((value) => Boolean(value)))
            htmlStatusServiceMock.didNotReceive().showStatus(Arg.any(), Arg.any(), Arg.is((value) => value === undefined));
        });

        htmlOptionsServiceMock.manageUrlPermissions(Arg.any()).throws(new Error(""));

        await testee.showAndHandleOptions();
    });
});
