import { Response, Request, CookieOptions } from "express";

export interface CustomResponse extends Response {
  body? : HttpResponse
}

export interface CustomRequest extends Request {
  startTime?  : Date;
}

export interface databaseParams {
  username: string;
  password: string;
  database: string;
  host : string;
  port?: number;
  tableName : string;
}

export interface mailerParams {
  smtp : string,
  port : number,
  user : string,
  password : string
}

export interface appConfig{

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
  state: string;
  message: string | object;
}

export interface SqlResponses {
  [key: string]: SqlResponse;
}

export interface HttpResponse {
  statusCode: number;
  state: string;
  message: string | object;
  link: string;
  token?: string;
}

export interface authToken {
  username: string;
  id: string;
  state: string;
}

export interface SignRequest1 {
  username: string;
  email: string;
  password: string;
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