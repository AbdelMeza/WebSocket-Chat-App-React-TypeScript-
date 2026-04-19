import mongoose, { Schema, Types } from "mongoose";

type messageType = {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId[];
  chatId: string;
  content: string;
};

const message_schema = new Schema<messageType>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    receiverId: [{ type: Schema.Types.ObjectId, ref: "user", required: true }],
    chatId: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export const message_model = mongoose.model<messageType>(
  "message",
  message_schema,
);
