import type { Request, Response } from "express";
import { user_model } from "../Models/user.model.ts";
import { chat_model } from "../Models/chat.model.ts";
import { getIO } from "../Socket.ts";
import { readToken } from "../utils/token.ts";

export async function getUserChats(
  req: Request,
  res: Response,
): Promise<void | Response> {
  try {
    const { userToken } = req.body;
    const decoded = readToken(userToken) as
      | { id: string; username: string }
      | false;

    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const userChats = await chat_model
      .find({ participants: decoded.id })
      .populate("participants", "username fullname")
      .populate("lastMessage", "content timestamp")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ user_chats: userChats });
  } catch (error) {
    console.error("Get User Chats Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createChat(
  req: Request,
  res: Response,
): Promise<void | Response> {
  try {
    const { user_id, current_user_id } = req.body;

    const [targetUser, currentUser] = await Promise.all([
      user_model.findById(user_id),
      user_model.findById(current_user_id),
    ]);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing_chat = await chat_model
      .findOne({
        isGroup: false,
        participants: { $all: [user_id, current_user_id] },
      })
      .populate("participants", "username fullname avatar");

    if (existing_chat) {
      return res.status(400).json({ message: "Existing conversation" });
    }

    const new_chat = await chat_model.create({
      participants: [user_id, current_user_id],
      isGroup: false,
    });

    const populatedChat = await new_chat.populate(
      "participants",
      "username fullname avatar",
    );

    populatedChat.participants.forEach((p: any) => {
      getIO().to(p._id.toString()).emit("chat:created", populatedChat);
    });

    return res.status(201).json({ new_chat: populatedChat });
  } catch (error) {
    console.error("Create Chat Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
