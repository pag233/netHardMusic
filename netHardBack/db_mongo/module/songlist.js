const mongoose = require('mongoose');

const songlistSchmema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        min: 1,
        max: 32
    },
    created_by: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    private: {
        type: Boolean,
        default: false
    },
    coverUrl: String,
    description: {
        type: String,
        default: ""
    },
    deleteable: { type: Boolean, default: true },
    played: { type: Number, default: 0 },
    tags: [String],
    faver: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    shared: { type: Number, default: 0 },
    tracks: [{ type: mongoose.Types.ObjectId, ref: "Song" }],
    icon: String,
    commentThread: { type: mongoose.Types.ObjectId, ref: "CommentThread" }
}, {
    timestamps: true,
});
exports.Songlist = mongoose.model('Songlist', songlistSchmema);