import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getAllConversations, getConversationById } from "../controllers/conversation.controller";

const router = Router();

router.use(authMiddleware)

router.get("/", getAllConversations);

router.get("/:id", authMiddleware, getConversationById);

export default router;
