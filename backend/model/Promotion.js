import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Untitled Campaign'
    },
    type: {
        type: String,
        enum: ['popup', 'bottom', 'inline'],
        default: 'popup'
    },
    mediaType: {
        type: String,
        enum: ['image', 'gif', 'video'],
        default: 'image'
    },
    mediaUrl: {
        type: String,
        default: ''
    },
    linkUrl: {
        type: String,
        default: ''
    },
    displayDuration: {
        type: Number,
        default: 5
    },
    frequency: {
        type: Number,
        default: 60
    },
    frequencyUnit: {
        type: String,
        default: 'minutes'
    },
    position: {
        type: String,
        default: 'center'
    },
    priority: {
        type: Number,
        default: 0
    },
    ctaText: {
        type: String,
        default: 'PLAY NOW'
    },
    showButton: {
        type: Boolean,
        default: false
    },
    canClose: {
        type: Boolean,
        default: true
    },
    fullMedia: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    impressions: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

promotionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
