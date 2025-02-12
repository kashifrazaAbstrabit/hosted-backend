export interface BRErrorParams {
    message?: string;
    displayMessage?: string;
    type?: string;
    stack?: any;
    code?: string;
    status?: number;
}

export class BRError extends Error {
    type?: string;
    code?: string;
    status: number;
    stack?: any;

    constructor(data: BRErrorParams) {
        super();
        this.message = data.message || this.message || "Something went wrong! Please try again later.";
        this.type = data.type;
        this.code = data.code;
        this.stack = data.stack || this.stack;
        this.status = data.status || 500;
    }
}