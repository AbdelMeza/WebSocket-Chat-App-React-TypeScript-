import { Router } from "express";
import { createMessage, getMessages } from "../Controllers/message.ts";

const messageRouter = Router();

messageRouter.post("/get", getMessages);
messageRouter.post("/create", createMessage);

export default messageRouter;
