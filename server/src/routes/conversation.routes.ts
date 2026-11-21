import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  getConversations,
  getConversationById,
  deleteConversation,
} from "../controllers/conversation.controller.js";

const router = Router();

router.use(protect);

router.get("/", getConversations);
router.get("/:id", getConversationById);
router.delete("/:id", deleteConversation);

export default router;
