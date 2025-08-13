import express from "express";
import {
    getConversation,
    addMessage,
    deleteMessage,
    updateMessage,
    getUnreadCountForContact,
    markMessagesAsRead
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/conversation", getConversation);
router.post("/", addMessage);
router.delete("/:msgId", deleteMessage);
router.put("/:msgId", updateMessage);
router.get("/unread/count/:contactWaId", getUnreadCountForContact);
router.put("/read/:contactWaId", markMessagesAsRead);

export default router;
