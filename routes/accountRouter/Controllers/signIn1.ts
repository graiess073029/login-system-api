import { NextFunction, Request, RequestHandler } from "express";
import { CustomResponse, HttpResponse, SqlResponse } from "../../../types/types.js";
import jwt from "jsonwebtoken";
import { createUser1 } from "../../../db/accountTable/create.js";
import { generateId } from "../../../utils/generatingId.js";
import {config} from '../../../config.js'
import isEmail  from "validator/lib/isEmail.js";
import isStrongPassword from "validator/lib/isStrongPassword.js";
export const signIn1: RequestHandler = async (
    req: Request,
    res: CustomResponse,
    next: NextFunction
): Promise<any> => {

    try {
        // Getting params from the request
        let { username, email, password } = req.body;

        // Verifying if parameters are valid 
        if (!username?.length) {

            let response : HttpResponse = {
                state: "error",
                message: "Please write a valid username",
                link : "",
                statusCode : 400
            }

            res.body = response
            res.status(400).json(response)

            next();
            return;

        }

        if (!(email && isEmail(email)) ){

            let response : HttpResponse = {
                state: "error",
                message: "Please write a valid email",
                link : "",
                statusCode : 400
            }

            res.body = response
            res.status(400).json(response)

            next();
            return;

        }

        if (!(password && isStrongPassword(password))) {

            let response : HttpResponse = {
                state: "error",
                message: "Please write a strong password",
                link : "",
                statusCode : 400
            }

            res.body = response
            res.status(400).json(response)

            next();
            return;

        }

        // Going to the next middleware if the headers are already sent
        if (res.headersSent){
            next();
            return;
        };

        let id = await generateId();

        // Creating a user and saving it in the database
        const user1_creation = await createUser1({
            username,
            password,
            email,
            id,
        }) as SqlResponse;


        // Returning the response to the user basing on the result of the createUser1 function

        if (user1_creation?.state !== "error") {
            // Generating an authentification token to create a session
            // Send a response to the user to redirect to the next step and send the token as a cookie
            const token = jwt.sign({ username, id, state: "logged_in" }, config.jwtAuth.secretKey, { algorithm: "HS256" });
            let response: HttpResponse = {
                state: user1_creation.state,
                message: user1_creation.message,
                link: "/",
                statusCode: 200,
            };

            res.body = response
            res.cookie("authToken", token, config.cookies);
            res.cookie("logOutKey", config.jwtAuth.logoutKey , config.cookies)
            res.json(response);
            next();
            return
        }

        // Returning an error response to the user with the error message
        // Either a 400 status code if the username or the email is already used
        // Or a 500 status code if an internal error happened
        let response: HttpResponse = {
            state: user1_creation.state,
            link: "",
            message: user1_creation.message,
            statusCode: 0,
        };

        if (response.message.toString().includes("already used")) {
            res.status(400).json({ ...response, statusCode: 400 })
            res.body = { ...response, statusCode: 400 }
            next();
        }
        else next(new Error(response.message as string));

        return;

    }

    catch (err) {
        next(err)
        return;
    }

};
