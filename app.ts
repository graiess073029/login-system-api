import { logger2 } from './logs/httpLogger/logger_part2.js';
import { logger1 } from './logs/httpLogger/logger_part1.js';
import { createServer } from 'http';
import { accountRouter } from './routes/accountRouter/accountRouter.js';
import { authVerif } from './middleware/authVerif.js';
import { errorLogger } from './logs/httpLogger/errorLogger.js';
import dotenv  from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import express,  { Application, NextFunction , Request } from "express"
import { HttpResponse } from './types/types.js';
import { CustomResponse } from './types/types.js';
import { config } from './config.js';

/**
 * @fileoverview Main Express application setup and configuration
 * Configures middleware, session handling, and routes for the authentication API
 */

const app: Application = express()
const server = createServer(app)

const corsOptions = {
    origin: config.origin, 
    methods: 'GET,POST,PUT,DELETE', 
    credentials: true, 
    optionsSuccessStatus: 200 
};

app.use(logger1)
app.use(helmet())
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { state : 'error' , message :  'Too many requests from this IP, please try again after 15 minutes', statusCode : 401, link : ""},
    standardHeaders: true,
    legacyHeaders: false, 
  }))
app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json());

app.use(authVerif)


app.use("/account", accountRouter)


app.get("/", async (req: Request, res: CustomResponse, next : NextFunction): Promise<any> => {   

    let response : HttpResponse = {
        state : "success",
        message : "Api Working !",
        statusCode : 200,
        link : ""
    }

    res.body = response
    res.json(response)
    next()
    return;
})

app.use(errorLogger)

app.use(logger2)

export default server;

