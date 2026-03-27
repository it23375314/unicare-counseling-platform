const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const User = require('../models/User');

// --- MULTER CONFIGURATION ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage: storage });

// Admin Delete Resource by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        res.json({ msg: 'Resource deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- ADMIN FUNCTIONS ---

// Updated to accept image, pdf, and audio file uploads
router.post('/add', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    try {
        const resourceData = { ...req.body };

        // Parse tags back into an array
        if (resourceData.tags && typeof resourceData.tags === 'string') {
            try { resourceData.tags = JSON.parse(resourceData.tags); } catch(e) {}
        }

        // 1. Process the Image Upload
        if (req.files && req.files['image']) {
            resourceData.imageUrl = `http://localhost:5000/uploads/${req.files['image'][0].filename}`;
        }


        // 2. Process the PDF Upload
        if (req.files && req.files['pdf']) {
            resourceData.resourceType = 'PDF';
            resourceData.content = `http://localhost:5000/uploads/${req.files['pdf'][0].filename}`;
        }

        // 3. Process the Audio Upload
        if (req.files && req.files['audio']) {
            resourceData.resourceType = 'Audio';
            resourceData.content = `http://localhost:5000/uploads/${req.files['audio'][0].filename}`;
        }

        const newResource = new Resource(resourceData);
        await newResource.save();
        res.status(201).json({ msg: "Resource Created Successfully" });
    } catch (err) {
        console.error("Add Resource Error:", err);
        res.status(500).json({ error: err.message });
    }
});


// Admin Edit Resource by ID
const editableFields = ['title', 'description', 'resourceType', 'category', 'difficulty', 'language', 'status'];
router.put(
    '/edit/:id',
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
        { name: 'audio', maxCount: 1 }
    ]),
    async (req, res) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid Resource ID' });
        }

        try {
            const resource = await Resource.findById(id);
            if (!resource) {
                return res.status(404).json({ msg: 'Resource not found' });
            }

            const updates = {};
            const files = req.files || {};

            if (files.image?.length) {
                updates.imageUrl = `http://localhost:5000/uploads/${files.image[0].filename}`;
            } else if (req.body.imageUrl) {
                updates.imageUrl = req.body.imageUrl;
            }

            if (files.pdf?.length) {
                updates.resourceType = 'PDF';
                updates.content = `http://localhost:5000/uploads/${files.pdf[0].filename}`;
            } else if (files.audio?.length) {
                updates.resourceType = 'Audio';
                updates.content = `http://localhost:5000/uploads/${files.audio[0].filename}`;
            } else if (req.body.content) {
                updates.content = req.body.content;
            }

            editableFields.forEach((field) => {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            });

            if (req.body.tags !== undefined) {
                if (typeof req.body.tags === 'string' && req.body.tags.trim()) {
                    try {
                        updates.tags = JSON.parse(req.body.tags);
                    } catch (parseErr) {
                        updates.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(Boolean);
                    }
                } else {
                    updates.tags = [];
                }
            }

            Object.assign(resource, updates);
            await resource.save();

            res.json({ msg: 'Resource updated successfully', resource });
        } catch (err) {
            console.error('Edit Resource Error:', err);
            res.status(500).json({ error: err.message });
        }
    }
);

// Admin Get All Resources (no filter)
router.get('/admin/all', async (req, res) => {
    try {
        const resources = await Resource.find({}).sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student Get All (Filtered)
router.get('/all', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { status: 'Published' };

        if (category && category !== 'All') query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student Bookmark Listing
router.get('/bookmarks/:userId', async (req, res) => {
    try {
        let { userId } = req.params;
        
        if (userId) userId = userId.replace(/['"]+/g, '');
        
        if (!userId) return res.status(400).json({ msg: 'Missing userId parameter' });
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ msg: 'Invalid User ID format' });

        const user = await User.findById(userId).populate('bookmarks');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json(user.bookmarks || []);
    } catch (err) {
        console.error("Get Bookmarks Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Toggle resource bookmark for a student
router.post('/bookmark/:resourceId', async (req, res) => {
    try {
        const { resourceId } = req.params;
        let { userId } = req.body;
        
        if (userId) userId = userId.replace(/['"]+/g, '');

        if (!userId || !resourceId) return res.status(400).json({ msg: 'userId and resourceId are required' });
        
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ msg: 'Invalid User ID format' });
        if (!mongoose.Types.ObjectId.isValid(resourceId)) return res.status(400).json({ msg: 'Invalid Resource ID format' });

        const resource = await Resource.findById(resourceId);
        if (!resource) return res.status(404).json({ msg: 'Resource not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isBookmarked = user.bookmarks && user.bookmarks.some(b => b.toString() === resourceId);
        
        let updatedUser;

        if (isBookmarked) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $pull: { bookmarks: resourceId } },
                { new: true } 
            );
        } else {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { bookmarks: resourceId } },
                { new: true }
            );
        }

        res.json({ bookmarks: updatedUser.bookmarks });
    } catch (err) {
        console.error("Bookmark Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Usage Tracking
router.post('/view/:id', async (req, res) => {
    try {
        const { itNumber } = req.body;
        const resourceId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(resourceId)) return res.status(400).json({ msg: 'Invalid Resource ID' });

        const resource = await Resource.findById(resourceId);
        if (!resource) return res.status(404).json({ msg: "Resource not found" });
        
        resource.usageCount = (resource.usageCount || 0) + 1;
        if (itNumber) resource.viewedBy.push({ studentId: itNumber, timestamp: new Date() });
        
        await resource.save();
        res.json({ msg: "Usage recorded" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;