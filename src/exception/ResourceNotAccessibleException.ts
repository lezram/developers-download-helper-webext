export class ResourceNotAccessibleException extends Error {
    private readonly exception: Error;

    constructor(message: string, exception?: Error) {
        super(message);
        this.exception = exception;
    }
}