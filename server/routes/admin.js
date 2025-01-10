const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { adminAuth, moderatorAuth } = require('../middleware/admin');

// Get all users (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user role (Admin only)
router.put('/users/:userId/role', auth, adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Ban user (Admin/Moderator)
router.put('/users/:userId/ban', auth, moderatorAuth, async (req, res) => {
    try {
        const { reason, duration } = req.body; // duration in days
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.isBanned = true;
        user.banReason = reason;
        user.banExpiration = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Unban user (Admin/Moderator)
router.put('/users/:userId/unban', auth, moderatorAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            {
                isBanned: false,
                banReason: null,
                banExpiration: null
            },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user (Admin only)
router.delete('/users/:userId', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete all user's posts and comments
        await Post.deleteMany({ author: user._id });
        await Comment.deleteMany({ author: user._id });
        await user.remove();
        
        res.json({ message: 'User and all associated content deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get system statistics (Admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const [
            totalUsers,
            totalPosts,
            totalComments,
            newUsersToday,
            newPostsToday,
            bannedUsers
        ] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Comment.countDocuments(),
            User.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            Post.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            User.countDocuments({ isBanned: true })
        ]);

        res.json({
            totalUsers,
            totalPosts,
            totalComments,
            newUsersToday,
            newPostsToday,
            bannedUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create category (Admin only)
router.post('/categories', auth, adminAuth, async (req, res) => {
    try {
        const { name, description, order } = req.body;
        const category = new Category({
            name,
            description,
            order
        });
        
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update category (Admin only)
router.put('/categories/:categoryId', auth, adminAuth, async (req, res) => {
    try {
        const { name, description, order } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.categoryId,
            { name, description, order },
            { new: true }
        );
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete category (Admin only)
router.delete('/categories/:categoryId', auth, adminAuth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        // Move all posts to a default category or delete them
        await Post.updateMany(
            { category: category._id },
            { category: process.env.DEFAULT_CATEGORY_ID }
        );
        
        await category.remove();
        res.json({ message: 'Category deleted and posts moved to default category' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
