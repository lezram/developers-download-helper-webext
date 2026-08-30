import {container} from "tsyringe";
import {BrowserPermissionService} from "../../../src/service/browser/BrowserPermissionService";
import * as browserMock from "../../test-support/BrowserMock";

describe("BrowserPermissionServiceTest", (): void => {

    let testee: BrowserPermissionService;

    beforeEach((): void => {
        container.reset();

        testee = container.resolve(BrowserPermissionService);
    });

    test("testRequestUrlPermission", async (): Promise<void> => {
        browserMock.permissions.request.mockResolvedValue(true);

        const result = testee.requestUrlPermission([]);

        await expect(result).resolves.toBeTruthy();
        expect(browserMock.permissions.request).toHaveBeenCalledWith({origins: []});
    });

    test("testRequestUrlPermissionFailed", async (): Promise<void> => {
        const error = new Error();
        browserMock.permissions.request.mockRejectedValue(error);

        const result = testee.requestUrlPermission([]);

        await expect(result).rejects.toBe(error);
        expect(browserMock.permissions.request).toHaveBeenCalledWith({origins: []});
    });

    test("testGetAllUrlPermissions", async (): Promise<void> => {
        browserMock.permissions.getAll.mockResolvedValue({origins: ["test"]});

        const permissions = await testee.getAllUrlPermissions();

        expect(permissions).toEqual(["test"]);
        expect(browserMock.permissions.getAll).toHaveBeenCalledTimes(1);
    });

    test("testRemoveUrlPermissions", async (): Promise<void> => {
        browserMock.permissions.remove.mockResolvedValue(true);

        const permissions = await testee.removeUrlPermissions(["test"]);

        expect(permissions).toBeTruthy();
        expect(browserMock.permissions.remove).toHaveBeenCalledWith({origins: ["test"]});
    });


});
