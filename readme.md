## Introduction 

This User Authentication API is a production-ready, secure authentication and user management system built with Node.js, Express, and TypeScript, testest with Jest and Supertest. It provides a robust foundation for handling user authentication, account management, and security in modern web applications. 
### Why Choose This API?
- **🛡️ Security First**: Implements industry-standard security practices including JWT, bcrypt hashing, and protection against common vulnerabilities
 - **🚀 Modern Stack**: Built with TypeScript for type safety and better developer experience 
 - **⚡ Performance**: Optimized database queries and connection pooling - **📈 Scalable**: Modular architecture designed for easy expansion 
 -  **🧪 Test Coverage**: Comprehensive test suite ensuring reliability 
 -  **📝 Well Documented**: Clear documentation and type definitions 

### Perfect For :
- Web Applications 
- Mobile App Backends 
- Microservices Architecture
- Ecommerce websites


## Features

### Authentication :

-   User registration with email verification
-   Login with username/email
-   Session-based authentication
-   Secure password hashing with bcrypt
-   JWT-based authentication
-   Rate limiting for security
-   CORS support
-   Helmet security headers

### Account Management : 

-   Update user profile (username/email)
-   Change password functionality
-   Password reset via email
-   Account deletion
-   Session management
-   Password updating

### Security Features : 

-   Password strength validation
-   Email format validation
-   Rate limiting on sensitive endpoints
-   HTTP-only cookies
-   CSRF protection
-   XSS protection via Helmet
-   Input sanitization
-   Secure session handling
-  Immune against SQL Injections

## Installation  

### Clone the repository :

```
git clone https://github.com/graiess073029/login-system-api
cd api2
```

### Install dependencies :

```
npm install
```

### Virtual environment configuration : 

1.  Create a  `.env`  file in the root directory with the following variables:

```python
# Database Configuration
USERNAME = your_db_username
PASSWORD = your_db_password
DB = your_database_name
HOST = your_database_host
PORT = your_database_port
ACCOUNTS_TABLE_NAME = your_database_accounts_tableName
RESET_TOKEN_TABLE_NAME = your_resetTokens_tableName

# Origins accepted by the server
ORIGIN = *

# JWT Configuration
# The logout key is a key that the server must get in the logout proccess to approve it. Otherwise, it'll responsd with an error
SECRETKEY = your_jwt_secret
LOGOUT_KEY = your_logout_key 

# SMTP Configuration
SMTP_Server = smtp.example.com
SMTP_PORT = your_smtp_port
EMAIL = your_email
PASS = your_email_password

# Server Configuration
SERVERPORT = your_server_port

```


## Running the API

### Development Mode : 

```
npm run dev
```

### Production Mode : 

```
npm run build
npm run start
```

### Testing : 

Run the test suite:

```
npm run test
```

## Integration
It is very simple to integrate this api in your apps and services:
    1. Make sure the api is running seperately from your main app (they don't share the same port or processes...)
    2. Making **GET** or **POST** requests to the api and direct the user basing on the api response :  
- **Exemple** :
to know if a user is logged in and has a valid account, you need to fetch **GET /account/auth/** and basing on the response you build your app.  
  - **Response exemple** : you redirect the user to the login page
```json
{
    "state" : "redirection",
    "link" : "/account/login",
    "message" : "unauthorized user",
    "statusCode" : 401
}
```

  - **Response exemple** : you let the user use your app 
```json
{
    "state" : "success",
    "link" : "",
    "message" : "authorized user",
    "statusCode" : 200
}
```

## API Documentation

### Authentication Endpoints

#### POST /account/signin :

Register a new user account.

Request body:

```json
{
    "email": "user@example.com",
    "username": "username",
    "password": "StrongPassword123!"
}

```

Response:

The response comes with two cookies : authToken which is a json-web-token containing the id and the username of the client and the logout key



```json
{
    "state": "success",
    "message": "user signed in successfully",
    "statusCode": 200,
    "link": "/"
}

```

#### POST /account/login : 

Login with email or username and password.

Request body:

```json
{
    "email": "e.mail@exemple.com",
    "password": "YourPassword123!"
}
```
**or**

```json
{
    "username": "yourUsername",
    "password": "YourPassword123!"
}
```

Response:

The response is similar to the one in **POST  account/signin** and comes with the same cookies

```json
{
    "state": "success",
    "message": "user logged in successfully",
    "statusCode": 200,
    "link": "/"
}

```

#### POST /account/logout
Logout current user session by clearing the authToken and logOutKey cookies

Response : 
```json
{
	"state"  : "redirection", 
	"message"  : 'logged out successfullly' ,
	"link"  : '/account/login', 
	"statusCode"  : 200
}
```


### Account Management Endpoints

#### GET /account/generalSettings

Get user profile information.

Response:

```json
{
    "state": "success",
    "message": {
        "username": "current_username",
        "email": "current_email@example.com"
    },
    "statusCode": 200
}

```

#### PUT /account/generalSettings

Update user profile information. You can update one of the username or the email or both at the same time.

Request body:

```json
{
    "newUsername": "new_username",
    "newEmail": "new_email@example.com"
}

```

#### POST /account/passwordMiss

The server sends a resetToken to the email address given in the request body to change the account's password

Request body:

```json
{
    "email": "user@example.com"
}

```

Response : 

```json
{
	"state" : "success",
	"message" : "A password reset link has been sent to your email",
	"statusCode" : 200,
	"link" : ""
}
```


#### GET /account/resetPassword/:resetToken/:email

When the user click on the link sent to his email address that token gets verified by the server and the server approves the password changed by redirecting

Response : 

```json
{
	"state": "redirection",
	"message": "Token verified successfully. You can now change your password",
	"statusCode": 200,
	"link": "/account/changePassword",
}
```

#### POST /account/changePassword

Change user password.

Request body:

```json
{
    "newPassword": "NewPassword123!"
}

```

#### POST /account/delete

Delete user account.

Response :
 ```json
{
	"state": "redirection",
	"message": user1_deletion.message,
	"link": "/account/login",
	"statusCode" : 200,
}
```


### Error Handling

When an error occurs, the error is logged in the console and saved in a file "error.log". For security reasons, the error message or description is not shown in the response : 

```json
{
    "state": "error",
    "message": "An internal server error has occured !",
    "statusCode": 500
}
```

### Security Considerations

1.  Password Requirements:
    
    -   Minimum 8 characters
    -   At least one uppercase letter
    -   At least one lowercase letter
    -   At least one number
    -   At least one special character
    
2.  Rate Limiting:
    
    -   Login attempts: 5 per 15 minutes
    -   Password reset requests: 1 per day
3.  Session Security:
    
    -   HTTP-only cookies
    -   Secure in production
    -   24-hour expiration
    -   Same-site policy

### Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Commit your changes
4.  Push to the branch
5.  Create a Pull Request

### License

This project is licensed under the ISC License.