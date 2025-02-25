import { config } from './../config.js';
import { NextFunction, RequestHandler, Response } from "express"; 
import jwt, { JwtPayload } from "jsonwebtoken"; 
import { authToken, CustomRequest, HttpResponse, User } from "../types/types.js";
import { select } from "../db/select.js";

/**
 * This middleware verifies the authenticity of the user using a JSON Web Token.
 * It checks if the request path is a registration path, an authentication path, or a path that needs authentication.
 * If the request path is a registration path, the middleware verifies if the user is not logged in.
 * If the request path is an authentication path, the middleware verifies if the user is logged in.
 * If the request path needs authentication, the middleware verifies if the user is logged in and if the user is authorized.
 * If the user is not authorized, the middleware sends a response with a 401 status code and a redirection link to the login page.
 * If the user is authorized, the middleware sends a response with a 200 status code.
 */

export const authVerif : RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction) : Promise<void> => {
    
    let path : string = req.path;


    // Manipulating the req.path
    if (req.path[req.path.length - 1] !== "/") {
        path += "/"
    }

    // Retrieving the auth token from cookies
    let token: string = req.cookies.authToken; 

    // Paths related to user registration
    const registrationPaths : Array<string> = ["/account/signin/","/account/login/","/account/resetPassword/","/account/changePassword/","/account/passwordMiss/"]; 
   
    // Path related to user authentication
    const authPath : string = "/account/auth/"; 
    
    // Path that doesn't need auth
    const unnecessary_auth_paths = ["/"]

    // Path that need auth
    const necessary_auth_paths = ["/account/logout/","/account/delete/","/account/securitySettings/","/account/generalSettings/"]


    // Sending a 404 error if the path doesn't exist
    if (![...registrationPaths.map(e => e.includes(path)), authPath.includes(path) , ...unnecessary_auth_paths.map(e => e.includes(path)), ...necessary_auth_paths.map(e => e.includes(path)) ].includes(true)) {
        let response: HttpResponse = {
            message: "Route not found",
            link: "",
            state: "error",
            statusCode: 404
        };
        res.status(response.statusCode).json(response); 
        return ;
    }
    

    try {  
        
        // Verifying if the request path doesn't need auth
        if (unnecessary_auth_paths.includes(path)){
            next(); 
            return ;
        }

        // Decoding the authToken and testing if it has expired

        let decodedToken: JwtPayload | authToken = jwt.verify(token, config.jwtAuth.secretKey) as JwtPayload; 

        // Getting user infos from the database
        const userInfo : User = (await select(config.database.accountsTableName,"*",`id="${decodedToken.id}" and username="${decodedToken.username}"`) as Array<User>)[0]; // Querying user information from the database

        // Sending a response to the user when the user does not exist
        if (!(userInfo)) {
            let response: HttpResponse = {
                message: "The user does not exist.",
                link: "/account/signin",
                state: "redirection",
                statusCode: 401
            };

            res.clearCookie("authToken",config.cookies)
            res.status(response.statusCode).json(response); // Sending a response if the user does not exist
            return ;
        }  
        
        // Preventing users to access after updating the password
        if (decodedToken.state === "logged_in"){
            let passwordUpdateDate : Date = userInfo.password_updated_at
            let loginDate : Date = userInfo.logged_in_at

            const test : boolean = (loginDate.getTime() - passwordUpdateDate.getTime()) >= 0

            if (!(test)){
                if ( registrationPaths.includes(path)){
                    next();
                    return;
                }
                let response: HttpResponse = {
                    message: "Password updated. You must log in again",
                    link: "/account/login",
                    state: "redirection",
                    statusCode: 401
                };
                res.status(response.statusCode).json(response); // Preventing users to access after updating the password
                return ;                
            }
        }

        // Preventing logged-in users from accessing registration paths
        if (registrationPaths.includes(path) && decodedToken.state === "logged_in") {
            let response: HttpResponse = {
                message: "You are already logged in.",
                link: "/",
                state: "redirection",
                statusCode: 403
            };
            res.status(response.statusCode).json(response); // Preventing logged-in users from accessing registration paths
            return ;
        }

        // Sends a response to the user when the user is authorized
        if (authPath == path && decodedToken.state === "logged_in") {
            let response: HttpResponse = {
                message: "authorized user.",
                link: "",
                state: "success",
                statusCode: 200
            };
            res.status(response.statusCode).json(response); // Success response for authorized users
            return ;
        }


    } 
    
    catch (err) {

        // Handling the case of a user who is not logged in and trying to log/sign in
        if (registrationPaths.map(e => path.startsWith(e)).includes(true)) {
             next()
            return ;    
        };

        // Handling token expiration errors
        if (err instanceof jwt.TokenExpiredError) {
            const response: HttpResponse = {
                message: "Your session has expired. Please log in again.",
                link: "/account/login",
                state: "redirection",
                statusCode: 401
            };

            res.clearCookie('authToken',{httpOnly : true, sameSite : true});
            res.status(response.statusCode).json(response); 
            return ;
        }

        // Handling other errors
        let response: HttpResponse = {
            statusCode: 401,
            message: `unauthorized user`,
            link: "/account/login",
            state: "redirection"
        };

        res.status(response.statusCode).json(response);
        return ;
    }

    next(); 
};
