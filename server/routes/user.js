const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's posts
router.get('/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id })
            .populate('category', 'name')
            .populate('author', 'username avatar')
            .sort('-createdAt');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's comments
router.get('/comments', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ author: req.user.id })
            .populate('post', 'title')
            .populate('author', 'username avatar')
            .sort('-createdAt');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, email, avatar, bio } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;
        if (bio) user.bio = bio;

        await user.save();
        
        // Return user without password
        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get public profile by username
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password -email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ author: user._id })
            .populate('category', 'name')
            .sort('-createdAt')
            .limit(5);

        const comments = await Comment.find({ author: user._id })
            .populate('post', 'title')
            .sort('-createdAt')
            .limit(5);

        res.json({
            user,
            recentPosts: posts,
            recentComments: comments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
