import { NextFunction , Request, RequestHandler } from "express"
import { CustomResponse, HttpResponse } from "../../../types/types.js";

export const deleteToken : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<any> => {

    const response : HttpResponse = {state : "redirection", message : 'logged out successfullly' ,link : '/account/login', statusCode : 200}
    res
    .status(response.statusCode)
    .clearCookie('authToken',{httpOnly : true, sameSite : true})
    .clearCookie('logOutKey',{httpOnly : true, sameSite : true})
    .json(response)
    res.body = response
    next();
    return;
    }