import { QueryResult} from 'mysql2/promise.js'
import { log } from '../utils/log.js';
import pool  from './initPool.js';


export const select = async (table : string, columns : string | Array<string> = "*" , condition : string = "") : Promise<QueryResult>  => {
    
    try{
        let query : string;
    
        if (columns instanceof Array) {
            let sqlColumns : string = "";
            columns = columns.map( e => sqlColumns+= e + ",")
            sqlColumns = sqlColumns.slice(0,-1)
            query = `SELECT ${sqlColumns} FROM ${table}`
        }

        else{
            query = `SELECT ${columns} FROM ${table}`
        }
        
        condition.length > 0 ? query += " WHERE " + condition + ";" : query += ";"

        let [res,feilds] = await pool.query(query)    

        let message = `Query : ${query}`

        await log(message, "info")

        return res
        }
        
    
    catch(err){
        await log((err as Error).message, "info")
        const response : QueryResult  = []
        return response   
    }
    
}