import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import authConfig from "../config/auth.js";
import { registerSchema } from "../validators/auth.validator.js";
import { loginSchema } from "../validators/auth.validator.js";

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validate incoming request data
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = validation.data;

    // 2. Check whether the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // 3. Hash the password
    const passwordHash = await bcrypt.hash(
      password,
      authConfig.bcryptSaltRounds,
    );

    // 4. Create the user
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    // 5. Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString() },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions["expiresIn"] },
    );

    // 6. Return response
    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle MongoDB duplicate-key error
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // 1. Validate request data
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    // 2. Find user and explicitly retrieve passwordHash
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 3. Compare submitted password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString() },
      authConfig.jwtSecret,
      {
        expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions["expiresIn"],
      },
    );

    // 5. Return authenticated user information
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
