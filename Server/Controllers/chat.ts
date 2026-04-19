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
      .populate(
        "participants",
        "username fullname defaultProfileColor lastSeen",
      )
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
    const { participants_ids, is_group, default_color } = req.body;

    if (!Array.isArray(participants_ids) || participants_ids.length < 2) {
      return res
        .status(400)
        .json({ message: "At least two participants are required" });
    }

    const foundUsers = await user_model.find({
      _id: { $in: participants_ids },
    });

    if (foundUsers.length !== participants_ids.length) {
      return res.status(404).json({ message: "One or more users not found" });
    }

    if (!is_group) {
      const existing_chat = await chat_model
        .findOne({
          isGroup: false,
          participants: {
            $all: participants_ids,
            $size: 2,
          },
        })
        .populate(
          "participants",
          "username fullname defaultProfileColor lastSeen",
        );

      if (existing_chat) {
        return res
          .status(200)
          .json({ new_chat: existing_chat, message: "Existing conversation" });
      }
    }

    const new_chat = await chat_model.create({
      participants: participants_ids,
      defaultColor: default_color,
      isGroup: is_group,
    });

    const populatedChat = await new_chat.populate(
      "participants",
      "username fullname defaultProfileColor lastSeen",
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
