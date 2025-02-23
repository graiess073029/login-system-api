import dotenv  from 'dotenv';
import { appConfig } from "./types/types.js";

/**
 * This file contains the configuration for the application.
 * The configuration is loaded from the .env file.
 * @module config
 */

dotenv.config()

export const config : appConfig = {
    
    cookies : {
        sameSite : "lax",
        secure : false,
        httpOnly : true
    },

    database : {
        username : process.env.USERNAME || "",
        password : process.env.PASSWORD || "",
        database : process.env.DB || "",
        host : process.env.HOST || "",
        port : Number(process.env.PORT) || 3306,
        tableName : process.env.TABLE_NAME || ""
    },

    jwtAuth : {
        secretKey : process.env.SECRETKEY || "secretKey",
        logoutKey : process.env.LOGOUT_KEY || "logOutKey"
    },

    mailer : {
        smtp : process.env.SMTP_Server as string,
        port : Number(process.env.SMTP_PORT),
        user : process.env.EMAIL as string ,
        password : process.env.PASS as string
    },

    sslOptions : {
        key : process.env.KEY as string,
        cert : process.env.CERT as string
    },

    serverPort : Number(process.env.SERVERPORT)

}