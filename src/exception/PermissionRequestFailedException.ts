export class PermissionRequestFailedException extends Error {
    constructor(message: string) {
        super(message);
    }
}