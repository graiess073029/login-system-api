import { SqlResponse, userLoginParams } from '../../types/types.js'
import isEmail from 'validator/lib/isEmail.js'
import { log } from '../../utils/log.js'
import pool from '../initPool.js'
import {config} from '../../config.js'
import bcrypt from 'bcryptjs'

export const loginUser = async (userParams : userLoginParams) : Promise<SqlResponse>  => {

    let response : SqlResponse;
    let { identifier, password} = userParams;

    let query : string;

    try{


        isEmail(identifier) ? query = `SELECT password FROM ${config.database.tableName} WHERE EMAIL="${identifier}";` : query = `SELECT password FROM ${config.database.tableName} WHERE USERNAME="${identifier}";`

        let [res , feilds] = await pool.query(query)
        let message = `Query : ${query}`

        await log(message, "info")

        let test : boolean = await bcrypt.compare(password,(res as Array<{password : string}>)[0].password);

        if ( res instanceof Array && res.length === 1 && test  ){
                response  = {
                state : "success",
                message : ` User found successfully !`,
            }
        }

        else if (res instanceof Array && res.length === 0 || res instanceof Array && res.length == 1 && !test){
                response = {
                state : "error",
                message : `No user was found with these parameters`,
            }
            throw new Error(response.message as string)

        }

        else{
                response  = {
                state : "error",
                message : `More than a user is found with these parameters`,
            }

            throw new Error(response.message as string)
        }

    }

    catch(err){
            
            await log((err as Error).message, "info")
            
            response  = {
                state : "error",
                message : (err as Error).message,
            }

            return response
    }

    isEmail(identifier) ? query = `UPDATE ${config.database.tableName} SET logged_in_at = CURRENT_TIMESTAMP WHERE email="${identifier}";` : query = `UPDATE ${config.database.tableName} SET logged_in_at = CURRENT_TIMESTAMP WHERE username="${identifier}";`

    try{

        let [res , rowsAffected] = await pool.query(query)

        let date = new Date().toString()
        let message = `-----\n Query : ${query}\n Date : ${date}\n-----\n`

        await log(message, "info")

        response  = {
            state : "success",
            message : `user logged in successfully`,
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