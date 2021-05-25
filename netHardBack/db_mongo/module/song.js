const mongoose = require('mongoose');

const songSchmema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        min: 1,
    },
    url: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    duration: { type: Number, required: true },
    size: Number,
    coverUrl: String,
    // commentThreadId: [{ type: Mongoose.Types.ObjectId, ref: "Comment" }]
    commentThreadId: String
}, {
    timestamps: true
});


exports.Song = mongoose.model('Song', songSchmema);