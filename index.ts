import { log } from "./utils/log.js";
import server from "./app.js";
import { config } from "./config.js";

// Making the http server in action
server.listen(config.serverPort, async () => await log("Server in action"))