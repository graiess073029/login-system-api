import bcrypt from 'bcryptjs';
import {config} from '../../config.js'
import { SqlResponse } from '../../types/types.js'
import { log } from '../../utils/log.js';
import pool from '../initPool.js';

export const updatePassword = async (userParams : {email : string , newPassword : string }) : Promise< SqlResponse >  => {

    let {  email , newPassword} = userParams;

    newPassword = await bcrypt.hash(newPassword,10)

    let query : string = `UPDATE ${config.database.tableName} SET password="${newPassword}" WHERE email="${email}";`;
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


    query = `UPDATE ${config.database.tableName} SET password_updated_at = CURRENT_TIMESTAMP WHERE email="${email}";`

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

            await log(err.message, "error")

            let response : SqlResponse = {
                state : "error",
                message : err.message,
            }

            return response
        }
    )




    return  password_Date_Update
    
}