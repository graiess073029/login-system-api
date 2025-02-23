import { Router } from "express";

import { securitySettings } from './Controllers/securitySettings.js';
import { signIn1 } from "./Controllers/signIn1.js";
import { deleteAccount } from "./Controllers/deleteAccount.js";
import { login } from "./Controllers/login.js";
import { deleteToken } from "./Controllers/deleteToken.js";
import { generalSettings, getGeneralSettings } from "./Controllers/generalSettings.js";
import { changePassword } from './Controllers/changePassword.js';
import { passwordMiss } from './Controllers/passwordMiss.js';
import { resetPassword } from './Controllers/resetPassword.js';

/**
 * This file contains the routes for the account router
*/

export const accountRouter = Router()


accountRouter.get("/generalSettings",getGeneralSettings)

accountRouter.get("/resetPassword/:resetToken/:email", resetPassword)


accountRouter.post('/passwordMiss', passwordMiss)

accountRouter.post("/changePassword", changePassword)

accountRouter.post("/delete" , deleteAccount)

accountRouter.post("/logout", deleteToken)

accountRouter.post("/signin", signIn1)

accountRouter.post("/login", login )


accountRouter.put("/generalSettings", generalSettings)
accountRouter.put("/securitySettings", securitySettings)


