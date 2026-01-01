import express from "express";

const router = express.Router();

router.get("/contacts",protectRoute,getAllContacts);
router.get("/chats",getChatPartners);
router.get("/:id",getMessagesByUserId);

router.post("/send/:id",sendMessage);

export default router;