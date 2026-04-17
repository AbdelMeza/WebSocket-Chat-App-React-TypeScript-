import mongoose, { Schema, Types } from "mongoose";

type messageType = {
  senderId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId;
  chatId: string;
  content: string;
};

const message_schema = new Schema<messageType>(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    chatId: { type: String },
    content: { type: String },
  },
  { timestamps: true },
);

export const message_model = mongoose.model<messageType>(
  "message",
  message_schema,
);
