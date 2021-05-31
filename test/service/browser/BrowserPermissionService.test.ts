import {container} from "tsyringe";
import {BrowserPermissionService} from "../../../src/service/browser/BrowserPermissionService";

describe("BrowserPermissionServiceTest", (): void => {

    let testee: BrowserPermissionService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserPermissionService);
    });

    test("testRequestUrlPermission", async (): Promise<void> => {
        mockBrowser.permissions.request //
            .expect({origins: []}) //
            .andResolve(true) //
            .times(1);

        const result = testee.requestUrlPermission([]);

        await expect(result).resolves.toBeTruthy();
    });

    test("testRequestUrlPermissionFailed", async (): Promise<void> => {
        const error = new Error();
        mockBrowser.permissions.request //
            .expect({origins: []}) //
            .andReject(error) //
            .times(1);

        const result = testee.requestUrlPermission([]);

        await expect(result).rejects.toBe(error);
    });

    test("testGetAllUrlPermissions", async (): Promise<void> => {
        const error = new Error();
        mockBrowser.permissions.getAll //
            .expect //
            .andResolve({origins: ["test"]}) //
            .times(1);

        const permissions = await testee.getAllUrlPermissions();

        expect(permissions).toEqual(["test"]);
    });

    test("testRemoveUrlPermissions", async (): Promise<void> => {
        const error = new Error();
        mockBrowser.permissions.remove //
            .expect({origins: ["test"]}) //
            .andResolve(true) //
            .times(1);

        const permissions = await testee.removeUrlPermissions(["test"]);

        expect(permissions).toBeTruthy();
    });


});
