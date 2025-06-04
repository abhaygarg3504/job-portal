import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    resume: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: true
    },
    isPro: {
        type: Boolean,
        default: false
    },
    proExpiresAt: {
        type: Date,
        default: null
    },
    savedJobs: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    }]
});


const User = mongoose.model('User', userSchema);

export default User;
