import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String, 
    required: true,
    refPath: "senderModel",
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["User", "Company"],
  },
  receiverId: {
    type: String, 
    required: true,
    refPath: "receiverModel",
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ["User", "Company"],
  },
  jobTitle: {
  type: String,
  required: false
},
  message: {
    type: String,
    default: "", 
  },
  image: {
    type: String, 
    default: "",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message
