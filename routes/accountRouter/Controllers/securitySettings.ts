import { NextFunction , Request, RequestHandler } from "express"
import { CustomResponse, HttpResponse, SqlResponse, SqlResponses, User } from "../../../types/types.js";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { select } from "../../../db/select.js";
import { setSecuritySettings } from "../../../db/accountTable/setSecuritySettings.js";
import {config} from '../../../config.js'
import bcrypt from "bcryptjs";

export const securitySettings : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<any> => {

    try{
        // Getting params from the request
        let { currentPassword, newPassword } = req.body
    
    // Verifying if these user params are valid (username or email and the password)
        if (!currentPassword){
            res.status(400).json({
                state: "error",
                message: "Please write your current password"
            }); return null;
        }
    
        if (!newPassword){
            res.status(400).json({
                state: "error",
                message: "Please write your new password"
            }); return null;
        }   
        
    // Decoding the auth token to get the user's username and id
        const {id , username} = jwt.decode(req.cookies.authToken) as JwtPayload

    // Verifying if the current password is correct

        const password_verification = (await select(config.database.tableName,"*",`id="${id}" and username="${username}"`) as Array<User> )[0]

        const test_password : boolean = await bcrypt.compare(currentPassword, password_verification.password)

    // Returning the response to the user basing on the result of the loginUser function
    
            if (password_verification && test_password) {
    
    // Updating the password of the user
                const password_update = await setSecuritySettings({id , username , newPassword , currentPassword}).then(
                    async (res: SqlResponses | SqlResponse) => {
                        let DbResponse : SqlResponse | SqlResponses = [(res as any).password_Date_Update.state,(res as any).passwordUpdateQuery.state].includes("success") ? { state: "success", message: "password updated successfully" } : res
                        let finalResponse : any = 
                        !DbResponse.state ? 
                        DbResponse = {state : "error" , message : (DbResponse as any).password_Date_Update.state === "error" ? (DbResponse as any).passwordUpdateQuery.message :(res as any).passwordUpdateQuery.message } 
                        : 
                        DbResponse;
                        return finalResponse as SqlResponse;
                    }
                )
    
    // Send a response to the user to confirm the password update
                let response: HttpResponse = {state : password_update.state , message : password_update.message, link: "", statusCode: 200}
                res.body = response
                res.json(response)
                next();
                return;
            }
    
    // Returning an error response to the user with the error message    
            let response: HttpResponse = {state : "error" , link : "", message: "Current password is not correct" , statusCode : 400}
            res.body = response
            res
            .status(response.statusCode)
            .json(response)
            
            next()

            return 
    }

   catch(err){
     next(err)        
     return ;
   }         
   
}
    
    