import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    questionImage: {
        type: String, // Path to local server file
        default: null
    },
    options: [{
        type: String,
        required: true,
        trim: true
    }],
    correctAnswerIndex: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

questionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
