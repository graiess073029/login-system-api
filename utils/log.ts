import { appendFile } from "fs/promises";

export const log = async (message : string , fileName : string = 'info') => {
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