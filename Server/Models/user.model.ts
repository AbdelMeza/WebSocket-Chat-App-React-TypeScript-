import mongoose, { Schema } from "mongoose";
import type { chatType } from "./chat.model.ts";

type User = {
  username: string;
  fullname: string;
  email: string;
  password: string;
  lastSeen: Date;
  defaultProfileColor: string;
  chats: chatType[];
};

const user_schema = new Schema<User>({
  username: {
    type: String,
    unique: true,
  },
  fullname: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  defaultProfileColor: String,
  lastSeen: Date,
  chats: {
    title: String,
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "chat" }],
    isGroup: Boolean,
    lastMessage: String,
  },
});

export const user_model = mongoose.model<User>("user", user_schema);
