import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export function roleMiddleware(requiredRole: string) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res
                .status(401)
                .json({ message: "Unauthorized: No user session found" });
        }

        if (user.role !== requiredRole) {
            return res
                .status(403)
                .json({ message: "Forbidden: Insufficient privileges" });
        }

        next();
    };
}

export default roleMiddleware;
