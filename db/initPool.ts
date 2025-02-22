import { log } from './../utils/log.js';
import { createPool } from "mysql2/promise.js";
import {config} from '../config.js'

const pool = createPool({
    host: config.database.host, 
    user: config.database.username, 
    password: config.database.password, 
    database: config.database.database, 
    port: config.database.port, 
    connectionLimit: 10, 
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
})

pool.getConnection()
    .then(async (cnx) => {
        await log(`Database launched Successfully.`, "info")
        cnx.release()

    })
    .catch(async (reason) => {
        await log(reason, "error")
    })
    

export default pool;
