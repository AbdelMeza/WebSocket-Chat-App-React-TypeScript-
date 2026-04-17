import type { Request, Response } from "express";
import { readToken } from "../utils/token.ts";
import { user_model } from "../Models/user.model.ts";

export async function userData(req: Request, res: Response): Promise<void> {
  try {
    const { userToken } = req.body as { userToken: string };

    if (!userToken) {
      res.status(400).json({ message: "Token is required" });
      return;
    }

    const decoded = readToken(userToken) as
      | { id: string; username: string }
      | false;

    if (!decoded) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const user = await user_model.findById(decoded.id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userChats = await user_model
      .findById(decoded.id)
      .populate({ path: "chats", populate: { path: "participants", select: "username" } })
      .select("chats");

    res.status(200).json({
      user: { username: user.username, id: user._id, chats: userChats?.chats || [] },
    });
  } catch (error) {
    console.error("Error in userData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
