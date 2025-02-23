import { SqlResponse} from '../../types/types.js'
import { log } from '../../utils/log.js';
import {config} from '../../config.js'
import pool from '../initPool.js';
import { verifyExistingUsers } from './create.js';

    /**
     * This function updates the email and/or the username of a user in the database.
     * 
     * @param userParams - An object with the following properties:
     *   - id: number - The id of the user
     *   - username: string - The current username of the user
     *   - newEmail?: string - The new email of the user (optional)
     *   - newUsername?: string - The new username of the user (optional)
     * 
     * @returns SqlResponse - A response object with a message and a state
     * 
     * @throws Error - If the user is not found or if an error occurs
     */
export const setGeneralSettings = async (userParams : {id : number , username : string ,newEmail? : string , newUsername? : string }) : Promise<SqlResponse>  => {

    let { username , id , newEmail, newUsername} = userParams;

    newEmail = newEmail?.replaceAll(" ","")
    newUsername = newUsername?.replaceAll(" ","")

    if (newEmail && await verifyExistingUsers("email",newEmail)){
        let response : SqlResponse = {
            state : "success",
            message : `email already used`,
        }

        return response
    }

    if (newUsername && await verifyExistingUsers("username",newUsername)){
        let response : SqlResponse = {
            state : "success",
            message : `username already used`,
        }

        return response
    }

    let query : string;

    !newEmail ? query = `UPDATE ${config.database.tableName} SET username="${newUsername}" WHERE id="${id}" AND username="${username}";` : query = ` UPDATE ${config.database.tableName} SET email="${newEmail}" WHERE id="${id}" AND username="${username}";`;
    !([newEmail,newUsername].includes(undefined) || [newEmail,newUsername].includes("")) ? query = ` UPDATE ${config.database.tableName} SET username="${newUsername}", email="${newEmail}" WHERE id="${id}" AND username="${username}";` : null;

    let res = await pool.query(query)

    .then(
        async (res) => {
            let message = `Query : ${query}`

            await log(message, "info")

            let response : SqlResponse = {
                state : "success",
                message : "user params updated successfully",
            }

            return response
        }
    )

    .catch(
        async (err : Error) => { 

            await log((err as Error).message, "error")

    
            let response : SqlResponse = {
                state : "error",
                message : err.message,
            }

            return response
        }
    )

    return res
    
}


