import jwt from 'jsonwebtoken';
import {config} from '../../../config.js'
import { updateState } from './../../../db/resetTable/updateState.js';
import { select } from './../../../db/select.js';
import { NextFunction, Request, RequestHandler } from "express";
import { CustomResponse, HttpResponse, resetToken } from "../../../types/types.js";
import { deleteToken } from '../../../db/resetTable/deleteToken.js';

export const resetPassword : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<void> => {

    const { resetToken, email } = req.params;


    try {
        const reset_token = (await select("RESET_PASSWORD", ['reset_token', 'expiration'], `reset_token="${resetToken}" AND user_email="${email}"`) as Array<resetToken>)[0]?.reset_token


        if (reset_token === resetToken) {


            jwt.verify(resetToken, process.env.SECRET_KEY as string, { algorithms: ["HS256"], ignoreExpiration: false });

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