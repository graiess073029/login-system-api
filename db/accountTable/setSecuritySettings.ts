import bcrypt from 'bcryptjs';
import {config} from '../../config.js'
import { SqlResponse, SqlResponses} from '../../types/types.js'
import { log } from '../../utils/log.js';
import pool from '../initPool.js';

    /**
     * @description This function updates the security settings of a user in the database.
     *              It takes the user's id, username, current password and new password as parameters
     *              It will verify if the current password is correct and update the password if it is
     *              It will also return a response to the user with a success or error message
     * @param userParams - An object with the following properties:
     *   - id: number - The id of the user
     *   - username: string - The username of the user
     *   - currentPassword: string - The current password of the user
     *   - newPassword: string - The new password of the user
     * @returns SqlResponse | SqlResponses - A response object with a message and a state
     * 
     * @throws Error - If the user is not found or if an error occurs
     */

export const setSecuritySettings = async (userParams : {id : number , username : string , newPassword : string }) : Promise< SqlResponse |SqlResponses>  => {

    let { username , id , newPassword} = userParams;

    newPassword = await bcrypt.hash(newPassword, 10)

    let query : string = `UPDATE ${config.database.tableName} SET password="${newPassword}" WHERE id="${id}" AND username="${username}";`;
    let passwordUpdateQuery = await pool.query(query)

    .then(
        async (res) => {

            await log(`Query : ${query}`,'info')

            let response : SqlResponse;

            if (undefined === true) {
                response = {
                    state : "error",
                    message : "invalid credentials",
                }
                return response  
            }

            response = {
                state : "success",
                message : "user params updated successfully",
            }

            return response
        }
    )

    .catch(
        async (err : Error) => { 

            await log(err.message, "error")

            let response : SqlResponse = {
                state : "error",
                message : err.message,
            }

            return response
        }
    )

    if (passwordUpdateQuery.state === "error"){
        return passwordUpdateQuery
    }

    query = `UPDATE ${config.database.tableName} SET password_updated_at = CURRENT_TIMESTAMP WHERE id="${id}" AND username="${username}";`;


    let password_Date_Update = await pool.query(query)
    .then(
        async (res) => {
            let message = `Query : ${query}`

            await log(message, "info")

            let response : SqlResponse;

            response = {
                state : "success",
                message : "user params updated successfully",
            }

            return response
        }
    )

    .catch(
        async (err : Error) => { 

            await log(err.message, "error")

            let response : SqlResponse = {
                state : "error",
                message : err.message,
            }

            return response
        }
    )

    return { passwordUpdateQuery , password_Date_Update}
    
}


