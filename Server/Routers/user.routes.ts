import { Router } from "express";
import { userData } from "../Controllers/user.ts";

const userRoutes = Router()

userRoutes.post("/get_data", userData)

export default userRoutes