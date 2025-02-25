
import { afterAll, beforeAll, expect } from "@jest/globals"
import { describe, it } from '@jest/globals';
import request from 'supertest';
import server from "./app.js";
import { deleteUser } from "./db/accountTable/deleteUser.js";
import { select } from "./db/select.js";
import pool from "./db/initPool.js";
import { config } from "./config.js";

/**
 * @fileoverview API Integration Test Suite
 * Tests user authentication, account management, and settings functionality
 * 
 * @requires jest
 * @requires supertest
 * @requires ./app
 * @requires ./db/accountTable/deleteUser
 * @requires ./db/select
 * @requires ./db/initPool
 * @requires ./config
 */



/**
 * Basic API endpoint tests
 * Validates core API functionality and error handling
 */


describe("Api classic tests", () => {

     /**
     * Tests the root endpoint response
     * @expect Returns 200 status with success message
     */
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

     /**
     * Tests 404 error handling
     * @expect Returns 404 status for unhandled routes
     */
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

/**
 * Input Validation Test Suite
 * Validates request payload requirements and format checking
 */

describe('Input validation tests',() => {

     /**
     * Tests login endpoint input validation
     * @expect Validates presence of email/username and password
     * @expect Validates email format
     */

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


/**
 * Functional Test Suite
 * Tests complete user lifecycle and account management features
 * @note These test are dependent on each other and should be run in order
 * @require a clean database to test 
 */

describe("Functionality tests",  () => {

    const agent = request.agent(server)

    /**
     * Test Setup
     * Cleans up any existing test users before running tests
     */

    beforeAll( async () => {


        const user_id : Array<{id : string}> = await select(config.database.accountsTableName,"id","username='test' OR username='test2' OR username='test3'") as Array<{id : string}>

        await Promise.all(user_id.map( async (id_object) => await deleteUser(id_object.id)))

    })


    /**
     * User Creation Test
     * @expect Successfully creates new user with test credentials
     * @timeout 5000ms
     */

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


    }, 5000)

    /**
      * Session Management Test
     * @expect Prevents duplicate login attempts
     * @timeout 5000ms
     */ 


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

    }, 5000)


    /**
     * Tests logout functionality
     * @expect Successfully logs out user and redirects to login
     * @timeout 5000ms
     */


    it("Logging out", async () => {
        
        const response = await agent.post("/account/logout")

        expect(response.body).toEqual({state : "redirection", message : 'logged out successfullly' ,link : '/account/login', statusCode : 200})

    }, 5000)


     /**
     * Tests login with both username and email
     * @expect Successfully logs in with either credential type
     * @timeout 5000ms
     */

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


    }, 5000)

    /**
     * Tests fetching user settings
     * @expect Returns user profile data with email and username
     * @timeout 5000ms
     */

    it('Getting general settings (user info : username - email)', async () => {

        const response = await agent.get("/account/generalSettings")

        expect(response.body).toEqual({
            state : "success",
            link : "",
            statusCode : 200,
            message : expect.objectContaining({email : expect.any(String), username : expect.any(String)})
        })

    }, 5000)

     /**
     * Tests username update functionality
     * @expect Successfully updates username and returns 200 status
     * @timeout 5000ms
     */

    it('Updating username', async () => {

        const response = await agent.put("/account/generalSettings").send({newUsername : "test2"})

        expect(response.body).toEqual({
            state: "success",
            message: "user params updated successfully",
            link: "",
            statusCode: 200,
        })
    }, 5000)

    /**
     * Tests email update functionality
     * @expect Successfully updates email and returns 200 status
     * @timeout 5000ms
     */

    it('Updating email', async () => {

        const response = await agent.put("/account/generalSettings").send({newEmail : "email.test2@test.com"})

        expect(response.body).toEqual({
            state: "success",
            message: "user params updated successfully",
            link: "",
            statusCode: 200,
        })
    }, 5000)

    /**
     * Tests simultaneous username and email update
     * @expect Successfully updates both fields and returns 200 status
     * @timeout 5000ms
     */

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
    }, 5000)

    /**
     * Tests password update functionality
     * @expect Successfully updates password and returns 200 status
     * @timeout 5000ms
     */

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
    }, 5000)
    
    /**
     * Tests account deletion
     * @expect Successfully deletes user and redirects to login
     * @timeout 5000ms
     */

    it('Deleting the user', async () => {


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
    }, 5000)

})

/**
 * Cleanup hook
 * @afterAll Closes server and database connections
 */

afterAll(() => {
    server.close();
    pool.end()
})
