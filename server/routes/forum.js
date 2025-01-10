const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { moderatorAuth } = require('../middleware/admin');

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('moderators', 'username')
            .sort('order');
        res.json(categories);
    } catch (error) {
        console.error('Error in /categories:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single category
router.get('/categories/:categoryId', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId)
            .populate('moderators', 'username avatar');
            
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json(category);
    } catch (error) {
        console.error('Error in GET /categories/:categoryId:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get posts by category
router.get('/categories/:categoryId/posts', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-lastActivity' } = req.query;
        
        const posts = await Post.find({ 
            category: req.params.categoryId,
            isDeleted: { $ne: true }
        })
            .populate('author', 'username avatar')
            .populate('category', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Post.countDocuments({ 
            category: req.params.categoryId,
            isDeleted: { $ne: true }
        });
        
        res.json({
            posts,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error in /categories/:categoryId/posts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new post
router.post('/posts', auth, async (req, res) => {
    try {
        const { title, content, categoryId, tags } = req.body;
        
        // Check if user is banned
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.isBanned) {
            return res.status(403).json({ 
                message: 'You are banned from posting',
                banReason: user.banReason,
                banExpiration: user.banExpiration
            });
        }

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        const post = new Post({
            title,
            content,
            author: req.user.id,
            category: categoryId,
            tags: tags || []
        });
        
        await post.save();
        
        const populatedPost = await Post.findById(post._id)
            .populate('author', 'username avatar')
            .populate('category', 'name');
            
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error in POST /posts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get post with comments
router.get('/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('author', 'username avatar')
            .populate('category', 'name')
            .populate('upvotes', 'username')
            .populate('downvotes', 'username')
            .populate('lastEditedBy', 'username');
            
        if (!post || post.isDeleted) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Increment view count
        post.views += 1;
        await post.save();
        
        const comments = await Comment.find({ 
            post: req.params.postId,
            isDeleted: { $ne: true }
        })
            .populate('author', 'username avatar')
            .populate('upvotes', 'username')
            .populate('downvotes', 'username')
            .populate('lastEditedBy', 'username')
            .sort('createdAt');

        res.json({ post, comments });
    } catch (error) {
        console.error('Error in GET /posts/:postId:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update post
router.put('/posts/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user is the author or a moderator
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (post.author.toString() !== req.user.id && !user.isModerator()) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }
        
        const { title, content, tags } = req.body;
        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;
        post.isEdited = true;
        post.lastEditedBy = req.user.id;
        post.lastEditedAt = Date.now();
        
        await post.save();
        
        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username avatar')
            .populate('category', 'name')
            .populate('lastEditedBy', 'username');
            
        res.json(updatedPost);
    } catch (error) {
        console.error('Error in PUT /posts/:postId:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add comment
router.post('/posts/:postId/comments', auth, async (req, res) => {
    try {
        // Check if post exists
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is banned
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isBanned) {
            return res.status(403).json({ 
                message: 'You are banned from commenting',
                banReason: user.banReason,
                banExpiration: user.banExpiration
            });
        }
        
        const { content, parentCommentId } = req.body;

        // If parentCommentId is provided, verify it exists
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
        }

        const comment = new Comment({
            content,
            author: req.user.id,
            post: req.params.postId,
            parentComment: parentCommentId || null
        });
        
        await comment.save();
        
        // Update post's lastActivity and commentCount
        await Post.findByIdAndUpdate(req.params.postId, {
            lastActivity: new Date(),
            $inc: { commentCount: 1 }
        });
        
        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'username avatar')
            .populate('upvotes', 'username')
            .populate('downvotes', 'username');
            
        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error in POST /posts/:postId/comments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Soft delete post
router.delete('/posts/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user is the author or a moderator
        const user = await User.findById(req.user.id);
        if (post.author.toString() !== req.user.id && !user.isModerator()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }
        
        post.isDeleted = true;
        post.deletedBy = req.user.id;
        post.deletedAt = Date.now();
        await post.save();
        
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /posts/:postId:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Hard delete post (Moderator only)
router.delete('/posts/:postId/permanent', auth, moderatorAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Delete all comments
        await Comment.deleteMany({ post: post._id });
        await post.remove();
        
        res.json({ message: 'Post and all associated comments permanently deleted' });
    } catch (error) {
        console.error('Error in DELETE /posts/:postId/permanent:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update comment
router.put('/comments/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check if user is the author or a moderator
        const user = await User.findById(req.user.id);
        if (comment.author.toString() !== req.user.id && !user.isModerator()) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }
        
        comment.content = req.body.content;
        comment.isEdited = true;
        comment.lastEditedBy = req.user.id;
        comment.lastEditedAt = Date.now();
        
        await comment.save();
        
        const updatedComment = await Comment.findById(comment._id)
            .populate('author', 'username avatar')
            .populate('upvotes', 'username')
            .populate('downvotes', 'username')
            .populate('lastEditedBy', 'username');
            
        res.json(updatedComment);
    } catch (error) {
        console.error('Error in PUT /comments/:commentId:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Soft delete comment
router.delete('/comments/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check if user is the author or a moderator
        const user = await User.findById(req.user.id);
        if (comment.author.toString() !== req.user.id && !user.isModerator()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }
        
        comment.isDeleted = true;
        comment.deletedBy = req.user.id;
        comment.deletedAt = Date.now();
        await comment.save();
        
        // Update post's comment count
        await Post.findByIdAndUpdate(comment.post, {
            $inc: { commentCount: -1 }
        });
        
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /comments/:commentId:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Vote on post
router.post('/posts/:postId/vote', auth, async (req, res) => {
    try {
        const { voteType } = req.body;
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user is banned
        const user = await User.findById(req.user.id);
        if (user.isBanned) {
            return res.status(403).json({ 
                message: 'You are banned from voting',
                banReason: user.banReason,
                banExpiration: user.banExpiration
            });
        }
        
        if (voteType === 'up') {
            if (post.upvotes.includes(req.user.id)) {
                post.upvotes.pull(req.user.id);
            } else {
                post.upvotes.addToSet(req.user.id);
                post.downvotes.pull(req.user.id);
            }
        } else {
            if (post.downvotes.includes(req.user.id)) {
                post.downvotes.pull(req.user.id);
            } else {
                post.downvotes.addToSet(req.user.id);
                post.upvotes.pull(req.user.id);
            }
        }
        
        await post.save();
        
        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username avatar')
            .populate('category', 'name')
            .populate('upvotes', 'username')
            .populate('downvotes', 'username');
            
        res.json(updatedPost);
    } catch (error) {
        console.error('Error in POST /posts/:postId/vote:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Vote on comment
router.post('/comments/:commentId/vote', auth, async (req, res) => {
    try {
        const { voteType } = req.body;
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check if user is banned
        const user = await User.findById(req.user.id);
        if (user.isBanned) {
            return res.status(403).json({ 
                message: 'You are banned from voting',
                banReason: user.banReason,
                banExpiration: user.banExpiration
            });
        }
        
        if (voteType === 'up') {
            if (comment.upvotes.includes(req.user.id)) {
                comment.upvotes.pull(req.user.id);
            } else {
                comment.upvotes.addToSet(req.user.id);
                comment.downvotes.pull(req.user.id);
            }
        } else {
            if (comment.downvotes.includes(req.user.id)) {
                comment.downvotes.pull(req.user.id);
            } else {
                comment.downvotes.addToSet(req.user.id);
                comment.upvotes.pull(req.user.id);
            }
        }
        
        await comment.save();
        
        const updatedComment = await Comment.findById(comment._id)
            .populate('author', 'username avatar')
            .populate('upvotes', 'username')
            .populate('downvotes', 'username');
            
        res.json(updatedComment);
    } catch (error) {
        console.error('Error in POST /comments/:commentId/vote:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Search posts
router.get('/search', async (req, res) => {
    try {
        const { q, category, sortBy = '-createdAt', page = 1, limit = 10 } = req.query;
        
        let query = { isDeleted: { $ne: true } };
        
        // Add search conditions
        if (q) {
            const searchRegex = new RegExp(q, 'i');
            query.$or = [
                { title: searchRegex },
                { content: searchRegex },
                { tags: searchRegex }
            ];
        }
        
        // Add category filter
        if (category) {
            query.category = category;
        }
        
        const posts = await Post.find(query)
            .populate('author', 'username avatar')
            .populate('category', 'name')
            .sort(sortBy)
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Post.countDocuments(query);
        
        res.json({
            posts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error in search:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
