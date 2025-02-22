import { config } from './../../config.js';
import { SqlResponse } from "../../types/types.js";
import { log } from "../../utils/log.js";
import pool from "../initPool.js";

export const deleteUser = async (
    id: string,
): Promise<SqlResponse> => {
    try {
        let query = `DELETE FROM ${config.database.tableName} WHERE id="${id}";`;
        await pool.query(query)
        let message = `Query : ${query}`

        await log(message, 'info')

        let response: SqlResponse = {
            state: "success",
            message: "user deleted successfully",
        };

        return response;
    }

    catch (err : unknown) {
        await log((err as Error).message, "error")

        let response: SqlResponse = {
            state: "error",
            message: (err as Error).message,
        };

        return response;
    }
};
