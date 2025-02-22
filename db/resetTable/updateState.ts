import { SqlResponse } from "../../types/types.js";
import pool from '../initPool.js'

export const updateState = async(newState : number, user_email : string,  token : string) : Promise<SqlResponse> => {
    
    try{
        let query = `UPDATE RESET_PASSWORD SET state=${newState} WHERE user_id="${user_email}" AND reset_token="${token}";`;
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