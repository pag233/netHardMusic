const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        index: true,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    like: {
        type: Number,
        default: 0
    },
    replyTo: {
        type: mongoose.Types.ObjectId,
        ref: "Comment"
    }
}, {
    timestamps: true
});

const commentThreadSchema = new mongoose.Schema({
    comments: [commentSchema]
}, {
    timestamps: true
});

exports.Comment = mongoose.model('Comment', commentSchema);
exports.CommentThread = mongoose.model('CommentThread', commentThreadSchema);