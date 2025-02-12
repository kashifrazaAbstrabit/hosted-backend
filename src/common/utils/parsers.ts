import { BRError } from "./errors";

const errorResponse = function (err: BRError) {
    return {
        success: false,
        error: {
            ...err
        }
    }
}

const successResponse = function (response:any) {
    return {
        success: true,
        data: Array.isArray(response) ? response : { ...response }
    };
}

export const ResponseWrapper = {
    success: successResponse,
    error: errorResponse
}