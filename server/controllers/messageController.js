import Message from "../models/Message.js";
import { v2 as cloudinary } from "cloudinary";
import {io, userSocketMap } from "../server.js";

// For user
// GET /api/messages?senderId=<USER_ID>&senderModel=User&receiverId=<COMPANY_ID>&receiverModel=Company
// For company side
// GET /api/messages?senderId=<COMPANY_ID>&senderModel=Company&receiverId=<USER_ID>&receiverModel=User

// my motto is to get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const { role: senderModel, withId: receiverId, withModel: receiverModel } = req.query;

    if (!senderId || !senderModel || !receiverId || !receiverModel) {
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const messages = await Message.find({
      $or: [
        { senderId, senderModel, receiverId, receiverModel },
        { senderId: receiverId, senderModel: receiverModel, receiverId: senderId, receiverModel: senderModel },
      ],
    }).sort({ createdAt: 1 });

    // After marking messages as read in getMessages
    const senderSocketId = userSocketMap[`${receiverModel}_${receiverId}`];
      if (senderSocketId) {
      io.to(senderSocketId).emit("unreadCountUpdate", {
    from: `${senderModel}_${senderId}`,
    count: 0
  });
   }

    await Message.updateMany(
      {
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
    const { message } = req.body;
    const { senderId, senderModel, receiverId, receiverModel } = req.query;

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
      message: message,
      image: imageUrl,
    });

    const receiverKey = `${receiverModel}_${receiverId}`;
    const receiverSocketId = userSocketMap[receiverKey];

  // After saving newMessage and before responding:
if (receiverSocketId) {
  // 1. Send new message
  io.to(receiverSocketId).emit("newMessage", newMessage);

  // 2. Send updated unread count
  const unreadCount = await Message.countDocuments({
    receiverId,
    receiverModel,
    senderId,
    senderModel,
    isRead: false
  });

  io.to(receiverSocketId).emit("unreadCountUpdate", {
    from: `${senderModel}_${senderId}`,
    count: unreadCount
  });
}
    return res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/messages/unread-count/:receiverId?receiverModel
export const getUnreadMessageCounts = async (req, res) => {
  try {
    const { id : receiverId } = req.params;
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
          _id: { senderId: "$senderId", senderModel: "$senderModel" },
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      counts: result.map(r => ({
        senderId: r._id.senderId,
        senderModel: r._id.senderModel,
        unreadCount: r.unreadCount
      }))
    });
  } catch (error) {
    console.error("Error getting unread counts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

