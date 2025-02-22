import { appendFile } from "fs/promises";
import chalk from "chalk";
import { NextFunction, RequestHandler } from "express";
import { CustomResponse } from "../../types/types.js";
import { CustomRequest } from "../../types/types.js";



export const logger2 : RequestHandler = async (req : CustomRequest , res : CustomResponse, next : NextFunction) : Promise<void> => {
    const line: string = "\n";
    const path: string = process.cwd() + "/logs/requests.log";

    const process_time : number | undefined = req.startTime?.getTime() ? new Date().getTime() - req.startTime?.getTime() : undefined

    try {

        if (res.headersSent){
            console.log(chalk.bgWhite(process_time + "ms"))
            console.log(chalk.red(`Status code :  ${(res.body?.statusCode)}`))
            console.log(chalk.yellow(`State :  ${(res.body?.state)}`))
            console.log(chalk.magenta(`Message :  ${(JSON.stringify(res.body?.message))}`))
            console.log(chalk.blue(`Link :  ${(res.body?.link)}`))
            console.log(chalk.bgWhite(line))


            await appendFile(path, (`Status code :  ${(res.body?.statusCode)}`))
            await appendFile(path, (`State :  ${(res.body?.state)}`))
            await appendFile(path, (`Message :  ${(JSON.stringify(res.body?.message))}`))
            await appendFile(path, (`Link :  ${(res.body?.link)}`))
            await appendFile(path, line)

            return

        }

        next()

    }

    catch (err) {
        console.log(err)
        return ;
    }


}
