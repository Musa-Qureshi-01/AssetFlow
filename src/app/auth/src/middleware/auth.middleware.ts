import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/token";
import { User } from "../models/user.model";
import { AuthRequest } from "../types";

async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Missing or malformed authorization header" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyAccessToken(token);

        const user = await User.findById(payload.sub);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({ message: "Token invalidated" });
        }

        req.user = {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.role as "user" | "admin",
            isEmailVerified: user.isEmailVerified,
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export default authMiddleware;
