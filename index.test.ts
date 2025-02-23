import { afterAll, beforeAll, expect } from "@jest/globals"
import { describe, it } from '@jest/globals';
import request from 'supertest';
import server from "./app.js";
import { deleteUser } from "./db/accountTable/deleteUser.js";
import { select } from "./db/select.js";
import pool from "./db/initPool.js";
import { config } from "./config.js";
import { QueryResult } from "mysql2/index.js";


/*
Before testing the api, we need to make sure that the Accounts table does not contain a user with these params:
    . username : test 
    . email : email.test@test.com
    ( . password : hhHHp$124$$mmM)
*/


describe("Api classic tests", () => {

    it("Api root endpoint testing", async () => {
        const response = await request(server).get("/");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            state: "success",
            message: "Api Working !",
            statusCode: 200,
            link: ""
        });
    });

    it("404 statusCode rendering", async () => {
        const response = await request(server).get("/anyRouteNotHandled");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            state: "error",
            message: "Route not found",
            statusCode: 404,
            link: ""
        });
    });

});

describe('Input validation tests',() => {

    // Login Endpoint

    it("identifier : email & username validation (Login endpoint)", async () => {
        const response = await request(server).post("/account/login").send({});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            state: "error",
            message: "Please write a valid email or username",
            link : "",
            statusCode: 400
        });
    });

    it("password validation (Login endpoint)", async () => {
        const response = await request(server).post("/account/login").send({email : "mmm.mm@mm.mm"});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            state: "error",
            message: "Please write your password",
            link : "",
            statusCode: 400
        });
    });

    it("email format validation (Login endpoint)", async () => {
        const response = await request(server).post("/account/login").send({email : "mmmmmmmmmm"});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            state: "error",
            message: "Please write a valid email",
            link : "",
            statusCode: 400
        });
    });

    // Signin Endpoint

    it("username validation (Signin endpoint)", async () => {
        const response = await request(server).post("/account/signin").send({});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            state: "error",
            message: "Please write a valid username",
            link : "",
            statusCode : 400
        });
    }); 

    it("password validation (Signin endpoint)", async () => {
        const response = await request(server).post("/account/signin").send({email : "mmm.mm@mm.mm" , username : "mmm"});
        console.log(response.body)
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            state: "error",
            link : "",
            statusCode : 400,
            message: "Please write a strong password"
        });
    });

    it("email format validation (Signin endpoint)", async () => {
        const response = await request(server).post("/account/signin").send({email : "mmmmmmmmmm", username : "mmm"});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            state: "error",
            message: "Please write a valid email",
            link : "",
            statusCode : 400
        });
    });

    // Password Miss endpoint

    it("email format validation (Password miss endpoint)", async () => {
        const response = await request(server).post("/account/passwordMiss").send({email : "mmmmmmmmmm"});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            state: "error",
            message: "Please write a valid email",
            statusCode : 400,
            link : ""
        });
    });

    // General settings endpoint

    // Security Settings endpoint


})

describe("Functionality tests",  () => {

    const agent = request.agent(server)

    beforeAll( async () => {

        // Deleting the test user / users if it exists.

        const user_id : Array<{id : string}> = await select(config.database.tableName,"id","username='test' OR username='test2' OR username='test3'") as Array<{id : string}>

        await Promise.all(user_id.map( async (id_object) => await deleteUser(id_object.id)))

    })



    it("Creating a new user", async () => {

        const response = await agent.post("/account/signin").send({
            email: "email.test@test.com",
            username: "test",
            password: "hhHHp$124$$mmM"
        })

        expect(response.body).toEqual({
            state: "success",
            message: "user signed in successfully",
            link: "/",
            statusCode: 200,
        })


    }, 10000)

    it("Logging in just after signing in", async () => {
        
        const response = await agent.post("/account/login")
        .send({
            email: "email.test@test.com",
            password: "hhHHp$124$$mmM"})

        expect(response.body).toEqual({
            message: "You are already logged in.",
            link: "/",
            state: "redirection",
            statusCode: 403
        })

    }, 10000)

    it("Logging out", async () => {
        
        const response = await agent.post("/account/logout")

        expect(response.body).toEqual({state : "redirection", message : 'logged out successfullly' ,link : '/account/login', statusCode : 200})

    }, 10000)

    it("Logging in (using the username and the email)", async () => {

        const response = await request(server).post("/account/login").send({
            email: "email.test@test.com",
            password: "hhHHp$124$$mmM"
        })

        expect(response.body).toEqual({
            state: "success",
            message: "user logged in successfully",
            link: "/",
            statusCode: 200,
        })

        const response2 = await agent.post("/account/login").send({
            username: "test",
            password: "hhHHp$124$$mmM"
        })

        expect(response2.body).toEqual({
            state: "success",
            message: "user logged in successfully",
            link: "/",
            statusCode: 200,
        })


    }, 10000)

    it('Getting general settings (user info : username - email)', async () => {

        const response = await agent.get("/account/generalSettings")

        expect(response.body).toEqual({
            state : "success",
            link : "",
            statusCode : 200,
            message : expect.objectContaining({email : expect.any(String), username : expect.any(String)})
        })

    }, 10000)

    it('Updating username', async () => {

        const response = await agent.put("/account/generalSettings").send({newUsername : "test2"})

        expect(response.body).toEqual({
            state: "success",
            message: "user params updated successfully",
            link: "",
            statusCode: 200,
        })
    }, 10000)

    it('Updating email', async () => {

        const response = await agent.put("/account/generalSettings").send({newEmail : "email.test2@test.com"})

        expect(response.body).toEqual({
            state: "success",
            message: "user params updated successfully",
            link: "",
            statusCode: 200,
        })
    }, 10000)

    it('Updating username and email', async () => {

        const response = await agent.put("/account/generalSettings").send
        ({
            newEmail : "email.test3@test.com",
            newUsername : "test3"
        })

        expect(response.body).toEqual({
            state: "success",
            message: "user params updated successfully",
            link: "",
            statusCode: 200,
        })
    }, 10000)

    it('Updating password', async () => {

        const response = await agent.put("/account/securitySettings").send
        
        ({
            newPassword : "$aHMp1$`lgto23F",
            currentPassword : "hhHHp$124$$mmM"
        })

        expect(response.body).toEqual({
            state: "success",
            message: "password updated successfully",
            link: "",
            statusCode: 200,
        })
    }, 10000)


    it('Deleting the user', async () => {

        // Logging again with the new password.

        await agent.post("/account/login").send({
            username : "test3",
            password : "$aHMp1$`lgto23F"
        })

        const response = await agent.post("/account/delete")

        expect(response.body).toEqual({
            state: "redirection",
            message: "user deleted successfully",
            link: "/account/login",
            statusCode: 200,
        })
    }, 10000)


})

afterAll(() => {
    server.close();
    pool.end()
})
