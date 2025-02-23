import { NextFunction , Request, RequestHandler } from "express"
import { CustomResponse, HttpResponse } from "../../../types/types.js";

/**
 * Handles the logout process by clearing the client's authentication cookies.
 * It sends a response indicating a successful logout and redirects the user to the login page.
 */


export const deleteToken : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<any> => {

    // Clearing the cookies of the client to erase his auth token

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