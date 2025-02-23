import { NextFunction, Request, ErrorRequestHandler } from "express";
import { appendFile } from "fs/promises";
import { CustomResponse, HttpResponse } from "../../types/types.js";

/**
 * Error logging middleware for Express applications.
 *
 * This middleware function logs error details to a file and sends a 
 * response to the client if headers have not been sent. It logs the 
 * error name, message, stack, and cause to a designated error log file.
 */

export const errorLogger : ErrorRequestHandler = async (err : Error , req : Request , res : CustomResponse , next : NextFunction) : Promise<void> =>{
    const line : string = "\n";
    const path : string = process.cwd() + "/logs/error.log";

    try {
        

        if (!err) next();

        console.log(err)

        await appendFile(path,line)
        await appendFile(path,(`${new Date().toString()} `))
        await appendFile(path,(`Name :  ${err.name} `))  
        await appendFile(path,(`Message :  ${err.message}`))    
        typeof err.stack === 'string' ? await appendFile(path,(`Stack :  ${err.stack}`)) : null;
        typeof err.cause === 'string' ? await appendFile(path,(`Cause :  ${err.cause} `)) : null;
        
        await appendFile(path,line);

        if (!res.headersSent){
            let response : HttpResponse = {
                statusCode : 500,
                state : "error",
                message : "An internal server error has occured",
                link : ""
            }
    
            res.status(response.statusCode).json(response)
            res.body = response
            next();
        }


    }

    catch(err){
        next()
    }

    return ;
}