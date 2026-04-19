import mongoose, { Schema } from "mongoose";

export type chatType = {
  title: string;
  participants: mongoose.Types.ObjectId[];
  isGroup: boolean;
  defaultColor: string;
  lastMessage: mongoose.Types.ObjectId;
};

const chat_schema = new Schema<chatType>(
  {
    title: { type: String },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isGroup: { type: Boolean, default: false },
    defaultColor: { type: String },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "message" },
  },
  { timestamps: true },
);

export const chat_model = mongoose.model<chatType>("chat", chat_schema);
