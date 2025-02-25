import { NextFunction, Request, RequestHandler } from "express"
import { CustomResponse, HttpResponse, SqlResponse, User } from "../../../types/types.js";
import { loginUser } from "../../../db/accountTable/loginUser.js";
import jwt from 'jsonwebtoken';
import {config} from '../../../config.js'
import { select } from "../../../db/select.js";
import isEmail from "validator/lib/isEmail.js";


/**
 * Handles user login requests by validating input parameters
 * and authenticating the user. Validates the presence and format
 * of email or username and checks the password. If successful, retrieves
 * user information from the database, generates an authentication token,
 * and sends it as a cookie, along with a success response. Otherwise,
 * returns an error response with appropriate status codes based on the
 * validation results or internal errors.
 */

export const login : RequestHandler = async (req: Request, res: CustomResponse, next: NextFunction): Promise<any> => {

    try {
        // Getting params from the request
        let { username , email, password } : {username : string , email : string , password : string} = req.body

        // Verifying if these user params are valid (username or email and the password)
        if (!(username?.length || email?.length)) {

            let response : HttpResponse = {
                state: "error",
                message: "Please write a valid email or username",
                link : "",
                statusCode : 400
            }

            res.body = response

            res.status(400).json(response); next();
            return;
        }

        if ( email &&  !isEmail(email)) {
           
            let response : HttpResponse = {
                state: "error",
                message: "Please write a valid email",
                link : "",
                statusCode : 400
            }

            res.body = response

            res.status(400).json(response);
            next()
            return;
        }

        if (!password) {
            let response : HttpResponse = {
                state: "error",
                message: "Please write your password",
                link : "",
                statusCode : 400
            }

            res.body = response

            res.status(400)
            .json(response);
            next();return;
        }

        let identifier: string = email ? email : username


        const user1_creation: SqlResponse = await loginUser({ identifier, password })

        // Returning the response to the user basing on the result of the loginUser function

        if (user1_creation.state !== "error") {

            // Getting the user id from the database
            let id = (await select(config.database.accountsTableName, "id", isEmail(identifier) ? `email="${identifier}" ` : ` username="${identifier}" `) as Array<User>)[0]?.id

            // Getting the username of the user from the database (if he logged in using his email)
            email ? username = (await select(config.database.accountsTableName, "username", `id="${id}" and email="${email}" `) as Array<User>)[0]?.username : null;

            // Generating a more permanent authentification token
            // Send a response to the user to redirect to the home page and send the token as a cookie
            const token = jwt.sign({ username, id, state: "logged_in" }, config.jwtAuth.secretKey, { expiresIn: '1d', algorithm : "HS256" });
            let response: HttpResponse = { state: user1_creation.state, link: "/", message: user1_creation.message as string, statusCode: 200 }
            res.body = response
            res.cookie('authToken', token, config.cookies)
            res.cookie('logOutKey', config.jwtAuth.logoutKey, config.cookies)
            res.json(response)
            next();
            return;
        }

        // Returning an error response to the user with the error message    

        let response: HttpResponse = { state: user1_creation.state, link: "", message: user1_creation.message, statusCode: 0 }

        //res.body = response

        if(response.message === "No user was found with these parameters") {
            res.status(400).json({ ...response, statusCode: 400 })
            res.body = { ...response, statusCode: 400 }
            next();
            return;
        } 
        else {
            throw new Error(response.message as string)
        }
    }

    catch(err){
        next(err)
        return ;
    }

}