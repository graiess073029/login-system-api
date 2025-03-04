import { config } from '../../config.js';
import { log } from './../../utils/log.js';
import { appendFile } from 'fs/promises'
import { SqlResponse } from '../../types/types.js'
import { select } from '../select.js'
import pool from '../initPool.js'


export const verifyExistingUsers = async (column : string , value : string) : Promise<boolean> => {
    let res = await select(config.database.tableName,"*",column + "=" + `"${value}"`)
    if (res instanceof Array && res.length > 0) {
        return true
    }

    return false
}

export const createUser1 = async (userParams : {
    username : string,
    password : string,
    email : string,
    id : string,
}) : Promise<SqlResponse>  => {


    try{
        let { username, email, password , id} = userParams;

        if (await verifyExistingUsers("username",username)){
            let response : SqlResponse = {
                state : "error",
                message : "username already used",
            }

            return response
        }

        if (await verifyExistingUsers("email",email)){
            let response : SqlResponse = {
                state : "error",
                message : `email already used`,
            }

            return response
        }

        let query = `INSERT INTO ${config.database.tableName} (id,username,email,password) VALUES ("${id}","${username}","${email}","${password}");`
        let [res,feildsAffected] = await pool.query(query)
        let date = new Date().toString()
        let message = `-----\n Query : ${query}\n Date : ${date}\n-----\n`
        await appendFile(process.cwd() + "/logs/info.log",message) 

        let response : SqlResponse = {
            state : "success",
            message : `user signed in successfully`,
        }
    
        return response

    }
    
    catch(err){
        await log((err as Error).message, "info")
        
        let response : SqlResponse = {
            state : "error",
            message : (err as Error).message,
        }

        return response
    }
    
        
    

}

