import { log } from "../../utils/log.js";
import { SqlResponse } from "../../types/types.js";
import pool from '../initPool.js'
import { config } from "../../config.js";



export const deleteToken = async(token : string) : Promise<SqlResponse> => {
    
    try{
        let query = `DELETE FROM ${config.database.resetPasswordTableName} WHERE reset_token="${token}";`;
        await pool.query(query)
        let message = `Query : ${query}`

        await log(message,"info")
        let response : SqlResponse = {
            state : "success",
            message : "Token deleted from the database succesfully"
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