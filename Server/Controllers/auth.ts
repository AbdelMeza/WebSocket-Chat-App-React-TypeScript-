import { createToken } from "../utils/token.ts";
import type { Request, Response } from "express";
import { user_model } from "../Models/user.model.ts";
import { comparePasswords, hashPassword } from "../utils/hashPass.ts";

// User login controller for the task management application.
// - Validates incoming fields
// - Checks if the user exists
// - Verifies the password
// - Generates a JWT token and returns the user (without password)
export async function login(req: Request, res: Response): Promise<void> {
  type user_data_type = {
    identifier: string;
    password: string;
  };

  try {
    const { identifier, password } = req.body as user_data_type;
    let existing_user;

    // Object used only for basic validation
    const errors: { field: string; message: string }[] = [];

    // --- Validate required fields ---
    if (!identifier || identifier.trim() === "") {
      errors.push({ field: "identifier", message: "this field is required" });
    } else {
      // --- Check if a user already exists with this username or email ---
      existing_user = await user_model.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });
      if (!existing_user) {
        errors.push({ field: "identifier", message: "Account not found" });
      }
    }
    if (!password || password.trim() === "")
      errors.push({ field: "password", message: "this field is required" });

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    // --- Verify the password using bcrypt ---
    // Reuse hashPass.comparePasswords to avoid exposing bcrypt details here.
    const isValidPassword = await comparePasswords( password, (existing_user as any).password,)

    if (!isValidPassword) {
      errors.push({ field: "password", message: "Password is incorrect" });
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    // --- Generate JWT token ---
    const token = createToken({
      id: existing_user!._id.toString(),
      username: existing_user!.username,
    }) as string | false;

    if (!token) {
      res.status(500).json({ message: "Authentification error" });
      return;
    }

    // --- Prepare the response without the password ---
    const userResponse = (existing_user as any).toObject() as {
      _id: string;
      username: string;
      email: string;
      password?: string;
    };
    delete userResponse.password;

    res.status(200).json({ user: userResponse, token });
  } catch (err) {
    // Log the error for debugging and return a generic error
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function signup(req: Request, res: Response): Promise<void> {
  type user_data_type = {
    username: string;
    fullname: string;
    email: string;
    password: string;
  };

  try {
    const { username, fullname, email, password } = req.body as user_data_type;
    const errors: { field: string; message: string }[] = [];

    // --- Validate required fields ---
    if (!username || username.trim() === "")
      errors.push({ field: "username", message: "this field is required" });
    if (!fullname || fullname.trim() === "")
      errors.push({ field: "fullname", message: "this field is required" });
    if (!email || email.trim() === "")
      errors.push({ field: "email", message: "this field is required" });
    if (!password || password.trim() === "")
      errors.push({ field: "password", message: "this field is required" });

    // --- Check if a user already exists with this username or email ---
    const existingUser = await user_model.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
      errors.push({
        field: "username",
        message: "An account already exists with this username or email",
      });
      res.status(400).json({ errors });
      return;
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    const hashedPassword = await hashPassword(password);

    if (!hashedPassword) {
      res.status(500).json({ message: "Error hashing password" });
      return;
    }
    // --- Create the user ---
    const newUser = await user_model.create({
      username: username,
      fullname: fullname,
      email: email,
      password: hashedPassword,
    });

    // --- Generate JWT token ---
    const token = createToken({
      id: newUser._id.toString(),
      username: newUser.username,
    }) as string | false;

    if (!token) {
      res.status(500).json({ message: "Authentification error" });
      return;
    }

    // --- Prepare the response without the password ---
    const userResponse = (newUser as any).toObject() as {
      _id: string;
      username: string;
      email: string;
      password?: string;
    };
    delete userResponse.password;

    res.status(201).json({ user: userResponse, token });
  } catch (err) {
    // Log the error for debugging and return a generic error
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
