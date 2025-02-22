import { SqlResponse } from "../../types/types.js";
import pool from '../initPool.js'

export const addToken = async(  email : string, token : string, expiration : string) : Promise<SqlResponse> => {
    
    try{
        let query = `INSERT INTO RESET_PASSWORD (user_email, reset_token, expiration) VALUES ("${email}","${token}",${expiration});`;
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