import { Response, Request, CookieOptions } from "express";

/**
 * @fileoverview Type definitions for HTTP responses and database operations
 * Contains interfaces and types used throughout the application
 */

export interface CustomResponse extends Response {
  body? : HttpResponse
}

export interface CustomRequest extends Request {
  startTime?  : Date; // Request processing start time
}

export interface databaseParams {
  username: string;
  password: string;
  database: string;
  host : string;
  port?: number;
  accountsTableName : string;
  resetPasswordTableName : string;
}

export interface mailerParams {
  smtp : string, // smtp server
  port : number,
  user : string,
  password : string
}

export interface appConfig{

  origin : Array<string> | string,
  cookies : CookieOptions,
  database : databaseParams,
  mailer : mailerParams,
  jwtAuth : {secretKey : string, logoutKey : string},
  sslOptions : {key : string, cert : string},
  serverPort : number
}

export interface ConditionParams {
  columns: string | Array<string>; 
  value: string | Array<string>;
}

export interface User {
  password_updated_at : Date;
  logged_in_at : Date;
  created_at : Date
  id: string;
  username: string;
  email: string;
  password: string;
}

export interface SqlResponse {
  state: 'success' | "error" | "redirection" ;
  message: string | object;
}

export interface SqlResponses {
  [key: string]: SqlResponse;
}

export interface HttpResponse {
  statusCode: number;
  state: 'success' | 'error' | 'redirection';
  message: string | object;
  link: string;
}

export interface authToken {
  username: string;
  id: string;
  state: string;
}

export interface userLoginParams {
  identifier: string;
  password: string;
}

export interface resetToken {
  reset_token : string,
  user_email : string,
  expiration: Date,
  created_at : Date,
  state : number
}