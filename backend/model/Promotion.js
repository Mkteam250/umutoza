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
    // Design & Content
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    themeColor: {
        type: String,
        default: '#4f46e5' // Indigo 600
    },
    textColor: {
        type: String,
        default: '#ffffff'
    },
    backgroundColor: {
        type: String,
        default: '#1e1b4b' // Indigo 950
    },
    buttonColor: {
        type: String,
        default: '#facc15' // Yellow 400
    },
    buttonTextColor: {
        type: String,
        default: '#000000'
    },
    layout: {
        type: String,
        enum: ['standard', 'glassmorphism', 'minimal', 'bold'],
        default: 'standard'
    },
    overlayOpacity: {
        type: Number,
        default: 0.8
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
    trickOnClose: {
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
    // Hourly Time-Sharing Scheduling
    minutesPerHour: {
        type: Number,
        default: 60, // How many minutes of the hour this ad takes (max 60)
        min: 1,
        max: 60
    },
    targetHours: {
        type: [Number], // Array of hours (0-23) this ad is active in
        default: [] // Empty means all 24 hours
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
