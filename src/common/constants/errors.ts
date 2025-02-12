import { BRError, BRErrorParams } from "../utils/errors";
import ErrorType from "./error-types";

export class InternalServerError extends BRError {
    constructor(error: BRErrorParams) {
        const _error = Object.assign(error, ErrorType.INTERNAL_SERVER_ERROR)
        super(_error);
    }
}