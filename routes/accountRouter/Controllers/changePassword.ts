import  jwt, { JwtPayload } from 'jsonwebtoken';
import { updatePassword } from './../../../db/accountTable/updatePassword.js';
import { NextFunction , Request, RequestHandler } from "express"
import { CustomResponse, HttpResponse, resetToken } from "../../../types/types.js";
import { select } from '../../../db/select.js';
import { deleteToken } from '../../../db/resetTable/deleteToken.js';
import { updateState } from '../../../db/resetTable/updateState.js';

export const changePassword : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<any> => {

    try{

        const {reset_token} = req.cookies

        if (!reset_token?.length){
            let response : HttpResponse = {
                state : "error",
                message : "reset token needed",
                link: "",
                statusCode: 400
            }
            res.status(400).json(response);
            res.body = response
            next()
            return;
        }


        const {email} = jwt.decode(reset_token) as JwtPayload

        const tokenInfo : resetToken | undefined = (await select("RESET_PASSWORD",'*',`reset_token="${reset_token}"`) as Array<resetToken> )[0]

        if(!tokenInfo){
            let response : HttpResponse = {
                state : "error",
                message : "reset token needed",
                link: "",
                statusCode: 400
            }
            res.status(400).json(response);
            res.body = response
            next()
            return;
        }

        if (tokenInfo.state == 0){
            let response : HttpResponse = {
                state : "error",
                message : "reset token hasn't been verified",
                link: "/resetToken/" + reset_token  + "/" + email,
                statusCode: 401
            }

            res.status(401).json(response);
            res.body = response
            next()
            return;
        }

        else if (tokenInfo.state == 2){
            let response : HttpResponse = {
                state : "error",
                message : "reset token has already been used",
                link: "",
                statusCode: 400
            }
            res.status(400).json(response);
            res.body = response
            next()
            return;
        }

        if(( new Date().getTime() - 1000*60*60 - tokenInfo.expiration.getTime()) > 0 ){
            let response : HttpResponse = {
                state : "redirection",
                message : "The reset token has expired. Please retry",
                link: "/account/login",
                statusCode: 403
            }
            await deleteToken(reset_token)
            res.status(403).json(response);
            res.body = response
            next()
            return;
        }

        // Getting params from the request
        let { newPassword } = req.body
    
    // Verifying if the new password are valid 

        if (!newPassword){
            res.status(400).json({
                state: "error",
                message: "Please write your new password",
                statusCode : 400,
                link : ""
            }); return null;
        }   
        
    
    // Decoding the auth token to get the user's username and id


            let password_update = await updatePassword({email , newPassword});
            await updateState(2,email,reset_token)

    
    // Send a response to the user to confirm the password update

            if (password_update.state !== "error") {
                let response: HttpResponse = {state : password_update.state , message : password_update.message, link: "", statusCode: 200}
                res.body = response
                res.json(response)
                next();
                return;
            }

            throw new Error(password_update.message as string)
            
    }

   catch(err){
     next(err)        
     return ;
   }         
   
}
    
    