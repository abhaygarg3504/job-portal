import Message from "../models/Message.js";
import { v2 as cloudinary } from "cloudinary";
import {io, userSocketMap } from "../server.js";

// For user
// GET /api/messages?senderId=<USER_ID>&senderModel=User&receiverId=<COMPANY_ID>&receiverModel=Company&jobTitle=JOBTITLE
// For company side
// GET /api/messages?senderId=<COMPANY_ID>&senderModel=Company&receiverId=<USER_ID>&receiverModel=User=JOBTITLE

// my motto is to get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const {
      role: senderModel,
      withId: receiverId,
      withModel: receiverModel,
      jobTitle,
    } = req.query;

    if (!senderId || !senderModel || !receiverId || !receiverModel || !jobTitle) {
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const messages = await Message.find({
      jobTitle,
      $or: [
        { senderId, senderModel, receiverId, receiverModel },
        { senderId: receiverId, senderModel: receiverModel, receiverId: senderId, receiverModel: senderModel },
      ],
    }).sort({ createdAt: 1 });

    // ✅ Fix: use correct socket key format
    const receiverKey = `${receiverModel}_${receiverId}_${jobTitle}`;
    const senderKey = `${senderModel}_${senderId}_${jobTitle}`;

    const receiverSocketId = userSocketMap[senderKey]; // Note: this is sender's socket to notify them

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("unreadCountUpdate", {
        from: `${receiverModel}_${receiverId}_${jobTitle}`,
        count: 0
      });
    }

    // ✅ Mark as read
    await Message.updateMany(
      {
        jobTitle,
        receiverId: senderId,
        receiverModel: senderModel,
        senderId: receiverId,
        senderModel: receiverModel,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// we use message Id
export const markMessageAsRead = async(req, res)=>{
  try {
    const {id : messageId} = req.params
    if(!messageId){
      return res.status(400).json({success: false, message: "messageId is required"})
    }

   const updateMessage = await Message.findByIdAndUpdate(messageId, { isRead: true }, { new: true });

    return res.status(200).json({
      success: true,
      updateMessage
    })
    
  } catch (error) {
    console.log(`error in mark Message read is `, error)
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { message, jobTitle } = req.body;
    const { senderId, senderModel, receiverId, receiverModel } = req.query;

    if (!senderId || !senderModel || !receiverId || !receiverModel || !jobTitle) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let imageUrl = "";
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      imageUrl = uploaded.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      jobTitle,
      message: message || "",
      image: imageUrl,
    });

    // ✅ Fix: key includes jobTitle
    const receiverKey = `${receiverModel}_${receiverId}_${jobTitle}`;
    const senderKey = `${senderModel}_${senderId}_${jobTitle}`;
    const receiverSocketId = userSocketMap[receiverKey];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);

      const unreadCount = await Message.countDocuments({
        senderId,
        senderModel,
        receiverId,
        receiverModel,
        jobTitle,
        isRead: false,
      });

      io.to(receiverSocketId).emit("unreadCountUpdate", {
        from: senderKey, // ✅ Also include jobTitle here
        count: unreadCount
      });
    }

    return res.status(200).json({ success: true, newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/messages/unread-count/:receiverId?receiverModel
export const getUnreadMessageCounts = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { receiverModel } = req.query;

    if (!receiverId || !receiverModel) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const result = await Message.aggregate([
      {
        $match: {
          receiverId,
          receiverModel,
          isRead: false
        }
      },
      {
        $group: {
          _id: {
            senderId: "$senderId",
            senderModel: "$senderModel",
            jobTitle: "$jobTitle"
          },
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      counts: result.map(r => ({
        senderId: r._id.senderId,
        senderModel: r._id.senderModel,
        jobTitle: r._id.jobTitle,
        unreadCount: r.unreadCount
      }))
    });
  } catch (error) {
    console.error("Error getting unread counts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

