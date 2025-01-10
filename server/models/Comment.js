const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastEditedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for nested replies
commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment'
});

// Update post's lastActivity when comment is added
commentSchema.post('save', async function() {
    if (!this.isDeleted) {
        await this.model('Post').findByIdAndUpdate(
            this.post,
            { 
                lastActivity: new Date(),
                $inc: { commentCount: 1 }
            }
        );
    }
});

// Update post's comment count when comment is deleted
commentSchema.pre('save', async function() {
    if (this.isModified('isDeleted') && this.isDeleted) {
        await this.model('Post').findByIdAndUpdate(
            this.post,
            { $inc: { commentCount: -1 } }
        );
    }
});

module.exports = mongoose.model('Comment', commentSchema);
