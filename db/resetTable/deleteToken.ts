import { SqlResponse } from "../../types/types.js";
import pool from '../initPool.js'

export const deleteToken = async(token : string) : Promise<SqlResponse> => {
    
    try{
        let query = `DELETE FROM RESET_PASSWORD WHERE reset_token="${token}";`;
        await pool.query(query)
        let message = `Query : ${query}`
        let response : SqlResponse = {
            state : "success",
            message : message
        }
        return response

    }

    catch(err){
        let response : SqlResponse = {
            state : "error",
            message : (err as Error).message
        }
        return response
    }

}