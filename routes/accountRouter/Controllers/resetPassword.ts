import jwt from 'jsonwebtoken';
import {config} from '../../../config.js'
import { updateState } from './../../../db/resetTable/updateState.js';
import { select } from './../../../db/select.js';
import { NextFunction, Request, RequestHandler } from "express";
import { CustomResponse, HttpResponse, resetToken } from "../../../types/types.js";
import { deleteToken } from '../../../db/resetTable/deleteToken.js';

/**
 * This request handler is used to verify a reset password token.
 * It takes a reset token and an email as parameters.
 * It will verify the token and update the state of the token in the database.
 * If the token is valid, it will set a cookie with the token and redirect the user to the change password page.
 * If the token has expired, it will delete the token and return a 403 status code with a link to the login page.
 * If the token is invalid, it will return a 400 status code with a link to the login page.
 */
export const resetPassword : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<void> => {

    const { resetToken, email } = req.params;


    try {

        // Getting the reset_token in the database
        const reset_token = (await select("RESET_PASSWORD", ['reset_token', 'expiration'], `reset_token="${resetToken}" AND user_email="${email}"`) as Array<resetToken>)[0]?.reset_token

        // Verifying if it's created by the server
        if (reset_token === resetToken) {

            // Verifying the token
            jwt.verify(resetToken, process.env.SECRET_KEY as string, { algorithms: ["HS256"], ignoreExpiration: false });

            // Updating the state of the token so the user can change his passwors
            await updateState(1, email, resetToken)


            let response: HttpResponse = {
                state: "redirection",
                message: "Token verified successfully. You can now change your password",
                statusCode: 200,
                link: "/account/changePassword",
            }
            res.cookie('resetToken', resetToken, config.cookies)
            res.status(200).json(response);
            res.body = response
            next()
            return;


        }
    }

    catch (err) {

        if (err instanceof jwt.TokenExpiredError) {
            let response: HttpResponse = {
                state: "success",
                message: "The reset token has expired. Please retry",
                statusCode: 403,
                link: "/account/login",
            }

            await deleteToken(resetToken)
            res.status(403).json(response);
            res.body = response
            next()
            return;

        }

        next(err);
        return;
    }


}