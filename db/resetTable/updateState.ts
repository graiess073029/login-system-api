import { SqlResponse } from "../../types/types.js";
import pool from '../initPool.js'
import {log} from '../../utils/log.js'
import { config } from "../../config.js";

export const updateState = async(newState : number, user_email : string,  token : string) : Promise<SqlResponse> => {
    
    try{
        let query = `UPDATE ${config.database.resetPasswordTableName} SET state=${newState} WHERE user_id="${user_email}" AND reset_token="${token}";`;
        await pool.query(query)
        let message = `Query : ${query}`

        await log(message,"info")

        let response : SqlResponse = {
            state : "success",
            message : "Token's state updated successfully"
        }
        return response

    }

    catch(err){

        await log((err as Error).message,"error")

        let response : SqlResponse = {
            state : "error",
            message : (err as Error).message
        }
        return response
    }

}