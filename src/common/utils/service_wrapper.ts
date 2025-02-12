import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "./handlers";

export const apiWrapper = function (api: Function) {
    return async function (req:Request, res:Response, next: NextFunction) {
        try {
            // Get custom parameters injected in middleware
            const response = await api(req);
            ResponseHandler.success(res, response);
        } catch (e) {
            // if an exception is raised, do not send any response
            // just continue performing the middleware chain
            next(e);
        }
    };
};
