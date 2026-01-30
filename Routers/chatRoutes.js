import express from "express";
import {getOrCreateConversation,sendMessage,getUserConversations,getMessages} from "../controllers/chatController.js";
import authenticate from "../middlewares/authenticate.js";
const router = express.Router();

// Route to get or create a conversation
router.post("/conversation", authenticate,getOrCreateConversation);

// Route to get list of conversations for a user
router.get("/conversations/:userId", authenticate,getUserConversations);

// Route to send a message
router.post("/message", authenticate,sendMessage);

// Route to get messages of a specific conversation
router.get("/messages/:conversationId", authenticate,getMessages);

export default router;
