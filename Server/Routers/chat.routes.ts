import { Router } from "express";
import { createChat, getUserChats } from "../Controllers/chat.ts";

const chatRoutes = Router()

chatRoutes.post("/get/all", getUserChats)
chatRoutes.post("/create", createChat)

export default chatRoutes