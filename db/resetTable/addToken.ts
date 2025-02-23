import { log } from "../../utils/log.js";
import { SqlResponse } from "../../types/types.js";
import pool from '../initPool.js'

/**
 * Inserts a reset password token into the database.
 *
 * @param email - The email of the user associated with the token.
 * @param token - The reset token to be stored.
 * @param expiration - The expiration time of the token.
 * @returns A promise that resolves to a SqlResponse indicating the success or failure of the operation.
 */

export const addToken = async(  email : string, token : string, expiration : string) : Promise<SqlResponse> => {
    
    try{
        let query = `INSERT INTO RESET_PASSWORD (user_email, reset_token, expiration) VALUES ("${email}","${token}",${expiration});`;
        await pool.query(query)
        let message = `Query : ${query}`

        await log(message,"info")
        let response : SqlResponse = {
            state : "success",
            message : "Token added to database successfully"
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