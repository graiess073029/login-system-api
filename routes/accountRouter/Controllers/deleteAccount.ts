import { NextFunction, Request, RequestHandler } from "express";
import { authToken, CustomResponse, HttpResponse } from "../../../types/types.js";
import jwt from "jsonwebtoken";
import { deleteUser } from "../../../db/accountTable/deleteUser.js";

/**
 * Handles the deletion of a user account by validating the request's
 * authentication token and deleting the user from the database.
 */

export const deleteAccount: RequestHandler = async (
  req: Request,
  res: CustomResponse,
  next: NextFunction
): Promise<void> => {
  try {
    // Decoding the authToken to get the user's id and username
    const { id }: authToken = jwt.decode(req.cookies.authToken) as authToken;

    const user1_deletion = await deleteUser(id);

    // Returning the response to the user basing on the result of the deleteUser function

    if (user1_deletion.state !== "error") {
      let response: HttpResponse = {
        state: "redirection",
        message: user1_deletion.message,
        link: "/account/login",
        statusCode: 200,
      };
      res.body = response;
      res.clearCookie("authToken", { httpOnly: true, sameSite: true });
      res.json(response);
      return;
    }

    throw new Error(user1_deletion.message as string);
  } catch (err) {
    // Returning an error response to the user with the error message

    next(err as Error);
    return;
  }
};
