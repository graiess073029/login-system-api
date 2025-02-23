import {config} from '../../../config.js'
import jwt  from 'jsonwebtoken';
import { addToken } from './../../../db/resetTable/addToken.js';
import isEmail from 'validator/lib/isEmail.js';
import {  CustomResponse, HttpResponse, } from './../../../types/types.js';
import { NextFunction, Request, RequestHandler } from "express";
import nodemailer from 'nodemailer'

/**
 * Handles the password reset request by validating the provided email,
 * generating a reset token, and sending a password reset link via email.
 * If the email is invalid, it returns an error response.
 */

export const passwordMiss : RequestHandler = async (req : Request, res : CustomResponse, next : NextFunction) : Promise<void> => {

    try{
        const { email } = req.body;

    
    if ( email &&  !isEmail(email)) {

        let response : HttpResponse = {
            state: "error",
            message: "Please write a valid email",
            statusCode : 400,
            link : ""
        }
        res.status(400).json(response);
        res.body = response
        next()
        return ;
    }

    const transporter = nodemailer.createTransport({
            secure : false,
            host : config.mailer.smtp,
            port :  config.mailer.port,
            auth : {
                user : config.mailer.user,
                pass : config.mailer.password
            }
    })

    // Generating the reset token and adding it to database
    const resetToken =  jwt.sign({email},config.jwtAuth.secretKey,{expiresIn : "15m", algorithm : "HS256"});

    const token_adding = await addToken(email,resetToken,"(NOW() + INTERVAL 15 MINUTE)")

    // Sending the token using the user's email if it's succesfully saved in the db
    if (token_adding.state !== "error") {

        const mailOptions = {
            from : config.mailer.user,
            to : email,
            subject : "Password reset",
            html : `<p>Click <a href="http://localhost:${process.env.PORT}/account/resetPassword/${resetToken}/${email}">here</a> to reset your password</p>`
        }

        await transporter.sendMail(mailOptions)

        let response : HttpResponse = {
            state: "success",
            message: "A password reset link has been sent to your email",
            statusCode : 200,
            link : ""
        }
        res.status(200).json(response);
        res.body = response
        next()
        return ;

    }

    else throw new Error(token_adding.message as string)
    
    }

    catch(err){
        next(err);
        return;
    }


}

