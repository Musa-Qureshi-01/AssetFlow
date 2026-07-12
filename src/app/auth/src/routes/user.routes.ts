import { Response, Router } from "express";
import requireAuth from "../middleware/auth.middleware";
import { AuthRequest } from "../types";

const router = Router();

router.get("/me", requireAuth as any, (req: AuthRequest, res: Response) => {
    return res.json({
        user: req.user,
    });
});

export default router;
