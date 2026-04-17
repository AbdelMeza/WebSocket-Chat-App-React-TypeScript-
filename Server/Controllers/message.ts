import type { Request, Response } from "express";
import { message_model } from "../Models/message.model.ts";
import { getIO } from "../Socket.ts";

export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    const chatId = req.body.chatId as string;

    const messages = await message_model
      .find({ chatId })
      .populate("senderId", "username")
      .populate("receiverId", "username")
      .sort({ createdAt: 1 });

    if (!messages) {
      res.status(404).json({ messages: [] });
      return;
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createMessage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { senderId, receiverId, chatId, content } = req.body;

    if (!senderId || !receiverId || !chatId || !content) {
      res.status(400).json({ error: "Error creating message" });
      return;
    }

    const new_message = await message_model.create({
      senderId,
      receiverId,
      chatId,
      content,
    });

    const populatedMessage = await new_message.populate("senderId", "username");

    getIO()
      .to(receiverId)
      .to(senderId)
      .emit("message:received", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
