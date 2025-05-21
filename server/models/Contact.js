import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  recruiterId: {
    type: String,
    ref: "Company",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  isUserOnline: {
    type: Boolean,
    default: false,
  },
  isRecruiterOnline: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);
