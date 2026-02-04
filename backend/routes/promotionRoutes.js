import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import Promotion from '../model/Promotion.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for promotion media uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/promotions');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `promo-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'));
        }
    }
});

// Helper for capacity check
const checkCapacity = async (type, minutesToAdd, targetHours, excludeId = null) => {
    // If targetHours is empty, it means all hours (0-23)
    const hoursToCheck = targetHours && targetHours.length > 0 ? targetHours : [...Array(24).keys()];

    // Get all active promotions of this type
    const query = { isActive: true, type };
    if (excludeId) query._id = { $ne: excludeId };

    const activePromotions = await Promotion.find(query);

    const conflicts = [];

    for (const h of hoursToCheck) {
        // Find promos that apply to this hour
        const promosInHour = activePromotions.filter(p =>
            p.targetHours.length === 0 || p.targetHours.includes(h)
        );

        const currentSum = promosInHour.reduce((sum, p) => sum + (p.minutesPerHour || 60), 0);

        if (currentSum + minutesToAdd > 60) {
            conflicts.push({
                hour: h,
                available: 60 - currentSum,
                requested: minutesToAdd,
                overage: (currentSum + minutesToAdd) - 60
            });
        }
    }

    return conflicts;
};

// Get all promotions (public - for displaying)
router.get('/public', async (req, res) => {
    try {
        const now = new Date();
        const activePromotions = await Promotion.find({
            isActive: true,
            $or: [
                { startDate: { $lte: now }, endDate: { $gte: now } },
                { startDate: null, endDate: null },
                { startDate: { $lte: now }, endDate: null },
                { startDate: null, endDate: { $gte: now } }
            ]
        }).sort({ priority: -1 });

        res.json(activePromotions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch promotions' });
    }
});

// Get all promotions (admin)
router.get('/', async (req, res) => {
    try {
        const promotions = await Promotion.find().sort({ createdAt: -1 });
        res.json(promotions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch promotions' });
    }
});

// Get single promotion
router.get('/:id', async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }
        res.json(promotion);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch promotion' });
    }
});

// Create new promotion
router.post('/', upload.single('media'), async (req, res) => {
    try {
        const safeParseInt = (val, fallback) => {
            const parsed = parseInt(val);
            return isNaN(parsed) ? fallback : parsed;
        };

        const safeParseFloat = (val, fallback) => {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? fallback : parsed;
        };

        const minutesPerHour = safeParseInt(req.body.minutesPerHour, 60);
        let targetHours = [];

        // Handle targetHours from FormData (handles both 'targetHours' and 'targetHours[]')
        const rawHours = req.body.targetHours || req.body['targetHours[]'];
        if (rawHours) {
            targetHours = Array.isArray(rawHours) ? rawHours.map(Number) : [Number(rawHours)];
            // Filter out any NaN values just in case
            targetHours = targetHours.filter(h => !isNaN(h));
        }

        // Capacity Check
        const conflicts = await checkCapacity(req.body.type || 'popup', minutesPerHour, targetHours);
        if (conflicts.length > 0) {
            return res.status(409).json({
                error: 'Capacity Exceeded',
                message: `Hour(s) ${conflicts.map(c => c.hour).join(', ')} are full. Cannot add ${minutesPerHour} minutes.`,
                conflicts
            });
        }

        const promotionData = {
            name: req.body.name || 'Untitled Campaign',
            type: req.body.type || 'popup',
            mediaType: req.body.mediaType || 'image',
            mediaUrl: req.file ? `/uploads/promotions/${req.file.filename}` : (req.body.mediaUrl || ''),
            linkUrl: req.body.linkUrl || '',
            displayDuration: safeParseInt(req.body.displayDuration, 5),
            frequency: safeParseInt(req.body.frequency, 0),
            frequencyUnit: req.body.frequencyUnit || 'minutes',
            position: req.body.position || 'center',
            priority: safeParseInt(req.body.priority, 0),
            ctaText: req.body.ctaText || 'PLAY NOW',
            showButton: req.body.showButton === 'true' || req.body.showButton === true,
            canClose: req.body.canClose === 'true' || req.body.canClose === true,
            fullMedia: req.body.fullMedia === 'true' || req.body.fullMedia === true,
            startDate: req.body.startDate || null,
            endDate: req.body.endDate || null,
            minutesPerHour: minutesPerHour,
            targetHours: targetHours,
            title: req.body.title || '',
            description: req.body.description || '',
            themeColor: req.body.themeColor || '#4f46e5',
            textColor: req.body.textColor || '#ffffff',
            backgroundColor: req.body.backgroundColor || '#1e1b4b',
            buttonColor: req.body.buttonColor || '#facc15',
            buttonTextColor: req.body.buttonTextColor || '#000000',
            layout: req.body.layout || 'standard',
            overlayOpacity: safeParseFloat(req.body.overlayOpacity, 0.8),
            isActive: req.body.isActive === 'true' || req.body.isActive === true
        };

        const newPromotion = new Promotion(promotionData);
        await newPromotion.save();

        res.status(201).json(newPromotion);
    } catch (err) {
        console.error('Error creating promotion:', err);
        res.status(500).json({ error: 'Failed to create promotion' });
    }
});

// Update promotion
router.put('/:id', upload.single('media'), async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        const safeParseInt = (val, fallback) => {
            const parsed = parseInt(val);
            return isNaN(parsed) ? fallback : parsed;
        };

        const safeParseFloat = (val, fallback) => {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? fallback : parsed;
        };

        const minutesPerHour = safeParseInt(req.body.minutesPerHour, promotion.minutesPerHour || 60);
        let targetHours = promotion.targetHours || [];

        // Handle targetHours from FormData
        const rawHours = req.body.targetHours || req.body['targetHours[]'];
        if (rawHours) {
            targetHours = Array.isArray(rawHours) ? rawHours.map(Number) : [Number(rawHours)];
            targetHours = targetHours.filter(h => !isNaN(h));
        }

        // Capacity Check
        const conflicts = await checkCapacity(req.body.type || promotion.type, minutesPerHour, targetHours, req.params.id);
        if (conflicts.length > 0) {
            return res.status(409).json({
                error: 'Capacity Exceeded',
                message: `Hour(s) ${conflicts.map(c => c.hour).join(', ')} are full. Cannot update to ${minutesPerHour} minutes.`,
                conflicts
            });
        }

        // If new media uploaded, delete old one
        if (req.file && promotion.mediaUrl && promotion.mediaUrl.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, '..', promotion.mediaUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const updateData = {
            ...req.body,
            mediaUrl: req.file ? `/uploads/promotions/${req.file.filename}` : (req.body.mediaUrl || promotion.mediaUrl),
            showButton: req.body.showButton !== undefined ? (req.body.showButton === 'true' || req.body.showButton === true) : promotion.showButton,
            canClose: req.body.canClose !== undefined ? (req.body.canClose === 'true' || req.body.canClose === true) : promotion.canClose,
            fullMedia: req.body.fullMedia !== undefined ? (req.body.fullMedia === 'true' || req.body.fullMedia === true) : promotion.fullMedia,
            isActive: req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : promotion.isActive,
            minutesPerHour: minutesPerHour,
            targetHours: targetHours,
            displayDuration: safeParseInt(req.body.displayDuration, promotion.displayDuration),
            priority: safeParseInt(req.body.priority, promotion.priority),
            frequency: safeParseInt(req.body.frequency, promotion.frequency),
            overlayOpacity: safeParseFloat(req.body.overlayOpacity, promotion.overlayOpacity)
        };

        const updatedPromotion = await Promotion.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedPromotion);
    } catch (err) {
        console.error('Error updating promotion:', err);
        res.status(500).json({ error: 'Failed to update promotion' });
    }
});

// Toggle promotion status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        promotion.isActive = !promotion.isActive;
        await promotion.save();
        res.json(promotion);
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});

// Track impression
router.post('/:id/impression', async (req, res) => {
    try {
        await Promotion.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to track impression' });
    }
});

// Track click
router.post('/:id/click', async (req, res) => {
    try {
        await Promotion.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to track click' });
    }
});

// Delete promotion
router.delete('/:id', async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        // Delete media file if exists
        if (promotion.mediaUrl && promotion.mediaUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', promotion.mediaUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Promotion.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Promotion deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete promotion' });
    }
});

export default router;
