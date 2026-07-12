import { Request } from "express";

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}
