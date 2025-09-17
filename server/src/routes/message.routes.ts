import { Router } from "express";
import { sendMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", rateLimiter, sendMessage);

export default router;
