import type { Request, Response } from "express";
import { user_model } from "../Models/user.model.ts";
import { readToken } from "../utils/token.ts";

export async function searchSysteme(
  req: Request,
  res: Response,
): Promise<void | Response> {
  try {
    const user_token = req.body.userToken;
    const search = req.query.search as string;
    const type = req.query.type as string;

    const decoded = readToken(user_token) as
      | { id: string; username: string }
      | false;

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser = await user_model.findById(decoded.id);

    const searchResult =
      type === "user" ? await searchUser(search, currentUser) : null;

    res.status(200).json(searchResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function searchUser(search: string, currentUser: any) {
  if (!search) return [];

  try {
    const regex = new RegExp("^" + search, "i");

    const users = await user_model
      .find({
        _id: { $ne: currentUser._id }, 
        $or: [
          { username: { $regex: regex } },
          { fullname: { $regex: regex } },
        ],
      })
      .select("_id username fullname defaultProfileColor")
      .limit(10);

    return users;
  } catch (error) {
    console.error("Mongoose Search Error:", error);
    throw new Error("Database search failed");
  }
}
