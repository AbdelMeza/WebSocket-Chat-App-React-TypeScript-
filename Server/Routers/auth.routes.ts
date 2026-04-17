import { Router } from "express";
import { login, signup } from "../Controllers/auth.ts";

const authRoutes = Router()

authRoutes.post("/login", login)
authRoutes.post("/signup", signup)

export default authRoutes