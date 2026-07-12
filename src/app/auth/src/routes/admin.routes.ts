import { Response, Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import roleMiddleware from "../middleware/role.middleware";
import { User } from "../models/user.model";
import { AuthRequest } from "../types";

const router = Router();

router.get(
    "/users",
    authMiddleware as any,
    roleMiddleware("admin") as any,
    async (_req: AuthRequest, res: Response) => {
        try {
            const users = await User.find(
                {},
                {
                    email: 1,
                    role: 1,
                    isEmailVerified: 1,
                    createdAt: 1,
                }
            ).sort({ createdAt: -1 });

            const result = users.map((u) => ({
                id: u.id,
                email: u.email,
                role: u.role,
                isEmailVerified: u.isEmailVerified,
                createdAt: u.createdAt,
            }));

            return res.json({ users: result });
        } catch (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

export default router;
