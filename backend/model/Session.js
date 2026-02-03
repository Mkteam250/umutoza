import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userImage: {
        type: String,
        default: null
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    score: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'completed'],
        default: 'active'
    },
    activity: {
        type: String,
        default: 'Yatangiye'
    }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
