import {config} from '../../config.js'
import { SqlResponse, SqlResponses} from '../../types/types.js'
import { log } from '../../utils/log.js';
import pool from '../initPool.js';

export const setSecuritySettings = async (userParams : {id : number , username : string , currentPassword : string , newPassword : string }) : Promise< SqlResponse |SqlResponses>  => {

    let { username , id , currentPassword, newPassword} = userParams;

    let query : string = `UPDATE ${config.database.tableName} SET password="${newPassword}" WHERE id="${id}" AND username="${username}" AND password="${currentPassword}";`;
    let passwordUpdateQuery = await pool.query(query)

    .then(
        async (res) => {
            let date = new Date().toString()
            let message = `-----\n Query : ${query}\n Date : ${date}\n-----\n`

            await log(message, "info")

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

            await log(err.message, "info")

            let response : SqlResponse = {
                state : "error",
                message : err.message,
            }

            return response
        }
    )


    query = `UPDATE ${config.database.tableName} SET password_updated_at = CURRENT_TIMESTAMP `

    if (passwordUpdateQuery.state === "error"){
        return passwordUpdateQuery
    }

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

            await log(err.message, "info")

            let response : SqlResponse = {
                state : "error",
                message : err.message,
            }

            return response
        }
    )




    return { passwordUpdateQuery , password_Date_Update}
    
}


