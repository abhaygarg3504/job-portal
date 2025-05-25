import express from "express";
import {
  getMessages,
  getUnreadMessageCounts,
  markMessageAsRead,
  sendMessage,
} from "../controllers/messageController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get("/:id", getMessages); 
router.get("/mark/:id", markMessageAsRead);
router.post("/send/:id", upload.single("image"), sendMessage); 
router.get("/unread-count/:id", getUnreadMessageCounts); 

export default router;
