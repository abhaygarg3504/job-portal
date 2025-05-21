import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: "User",
        required: true
    },

    plan: {
        type: String,
        required: true,
    },

    amount: {
        type: Number,
        required: true
    },

    durationInMonths: {
        type: Number,
        default: 5
    },

    payment:{
        type: Boolean,
        default: false
    },
    date:{
        type: Number,
    }
});
const transactionModel = mongoose.model("transaction", transactionSchema);
export default transactionModel;
