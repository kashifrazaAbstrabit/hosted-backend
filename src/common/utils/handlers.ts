import { NextFunction, Response, Request } from "express";
import { InternalServerError } from "../constants/errors";
import { ResponseWrapper } from "./parsers";

export const errorHandler = function (err: any, req: Request, res: Response, next: NextFunction) {
  let error = err;

  if (!err.status) {
    error = new InternalServerError(err);
  }
  console.error(error);
  let status = err.status || 500;



  ResponseHandler.error(res, error, status);
};

function successWrapper(res: Response, data: any, status: number = 200) {
  return res.status(status).json(ResponseWrapper.success(data));
}

function errorWrapper(res: Response, err: any, status: number = 500) {
  return res.status(status).json(ResponseWrapper.error(err));
}

export const ResponseHandler = {
  success: successWrapper,
  error: errorWrapper
}