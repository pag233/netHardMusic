const mongoose = require('mongoose');

const privatecontentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    coverUrl: { type: String, required: true },
}, {
    timestamps: true
});


module.exports = mongoose.model('PrivateContent', privatecontentSchema);