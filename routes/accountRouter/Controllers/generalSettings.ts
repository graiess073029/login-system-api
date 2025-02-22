import { setGeneralSettings } from './../../../db/accountTable/setGeneralSettings.js';
import { NextFunction ,Response, Request, RequestHandler } from "express"
import { CustomResponse, HttpResponse, User } from "../../../types/types.js";
import {config} from '../../../config.js'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { select } from "../../../db/select.js";

export const generalSettings : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<any> => {

    // Getting params from the request
        let { newEmail, newUsername } = req.body
    
    // Verifying if one of parameters are valid (second verification)
        if (!( newUsername || newEmail )){
            res.status(400).json({
                state: "error",
                message: "Please write your new email or username"
            }); return null;
        }
        

    // Getting the id and the username of the user from the jsonwebtoken

        const {id ,username  } = jwt.decode(req.cookies.authToken) as JwtPayload 
    
    // Updating the general settings of the user (username or email or both of them)

        const user1_creation = await setGeneralSettings({id , username , newEmail, newUsername})

        
    // Returning the response to the user basing on the result of the loginUser function
    
        if (user1_creation.state !== "error") {

    // Send a response to the user to confirm the modification of his settings
            let response: HttpResponse = {state : user1_creation.state , link : "", message: user1_creation.message, statusCode: 200}
            const token = jwt.sign({ username : newUsername?.length ? newUsername : username, id, state: "logged_in" }, config.jwtAuth.secretKey, { expiresIn: '1d', algorithm : "HS256" });
            
            res.body = response
            res.cookie('authToken', token, config.cookies)
            res.json(response)
            next();
            return;
        }
            
    // Returning an error response to the user with the error message    

        next(new Error(user1_creation.message as string))


        return null
}
    
export const getGeneralSettings : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<any> => {

    // Getting the id and the username of the user from the jsonwebtoken
        const {id , username} = jwt.decode(req.cookies.authToken) as JwtPayload 
    
        try{
    
    // Getting the firstName, lastName and bio of the user
            
        const email : string | undefined = (await select(config.database.tableName,"email",` username="${username}" and id="${id}"`) as Array<User>)[0]?.email

    // Send a response to the user that contains the email and username requested
            
            const response: HttpResponse = {state : "success" , link : "", message: {email,username}, statusCode: 200}
            res.body = response
            res.json(response)
            next();
            return;

        }

        catch(err){
            next(err)

        }
        
    
}
