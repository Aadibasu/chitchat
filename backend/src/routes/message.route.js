import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllContacts ,getChatPartners,getMessagesByUserId,sendMessage, deleteMessage } from "../controllers/message.controllers.js";


const router = express.Router();

router.get("/contacts",protectRoute,getAllContacts);
router.get("/chats",protectRoute,getChatPartners);
router.get("/:id",protectRoute,getMessagesByUserId);
router.post("/send/:id",protectRoute,sendMessage);

// allow sender to delete a specific message
router.delete("/:id", protectRoute, deleteMessage);

export default router;

