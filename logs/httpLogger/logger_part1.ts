import { NextFunction, RequestHandler, Response } from "express";
import { appendFile } from "fs/promises";
import chalk from "chalk";
import { CustomRequest } from "../../types/types.js";





export const logger1 : RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction) : Promise<void> =>  {
    const line: string = "\n";
    const path: string = process.cwd() + "/logs/requests.log";

    try {

        req.startTime = new Date()

        console.log(chalk.bgWhite(line))
        console.log(chalk.yellow(`${new Date().toString()}`))
        console.log(chalk.magenta(`Request from ${req.ip}`))
        console.log(chalk.blue(`Method :  ${req.method}`))
        console.log(chalk.blue(`Protocol :  ${req.protocol}`))
        console.log(chalk.bold(`Body :  ${JSON.stringify(req.body)}`))
        console.log(chalk.bold(`Queries :  ${JSON.stringify(req.query)}`))
        console.log(chalk.bold(`Parameters :  ${JSON.stringify(req.params)}`))
        console.log((`Path : ${req.path}`))
        console.log(chalk.redBright(`User Agent :  ${JSON.stringify(req.headers["user-agent"])} `))
        console.log(chalk.red(`Headers :  ${JSON.stringify(req.headers)}`))


        await appendFile(path, line)
        await appendFile(path, (`${new Date().toString()}`))
        await appendFile(path, (`Request from ${req.ip}`))
        await appendFile(path, (`Method :  ${req.method}`))
        await appendFile(path, (`Protocol :  ${req.protocol}`))
        await appendFile(path, (`Body :  ${JSON.stringify(req.body)}`))
        await appendFile(path, (`Queries :  ${JSON.stringify(req.query)}`))
        await appendFile(path, (`Parameters :  ${JSON.stringify(req.params)}`))
        await appendFile(path, (`Path :  ${req.path}`))
        await appendFile(path, (`User Agent :  ${JSON.stringify(req.headers["user-agent"])}`))
        await appendFile(path, (`Headers :  ${JSON.stringify(req.headers)}`))

    }

    catch (err) {
        next(err)
        return ;
    }

    next()

}
