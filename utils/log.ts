import { appendFile } from "fs/promises";


/**
 * Logs a message to the console and to a file.
 *
 * @param {string} message the message to log
 * @param {string} [fileName='info'] the name of the file to log to
 *
 * @returns {Promise<boolean>} true if successful, false if not
 */

export const log = async (message : string , fileName : string = 'info'): Promise<boolean> => {
    const line: string = "\n";
    const path: string = process.cwd() + "/logs/" + fileName + ".log";

    try {

        console.log( line)
        console.log( (`${new Date().toString()}`))
        console.log( message)
        console.log( line)

        if (fileName){
            await appendFile(path, line)
            await appendFile(path, (`${new Date().toString()}`))
            await appendFile(path, message)
            await appendFile(path, line)
        }

        return true

    }

    catch (err) {
        return false
    }

}