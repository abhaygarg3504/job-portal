import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    date: {
        type: Number,
        required: true
    },
    interviewDate: {
        type: Date,
        default: null // 👈 Safe default for older entries
    }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication
