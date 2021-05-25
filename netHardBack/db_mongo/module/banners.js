const Mongoose = require('mongoose');

const bannerSchema = new Mongoose.Schema({
    imageId: {
        type: Number,
        required: true,
        index: true,
        unique: true
    },
    imageUrl: {
        type: String,
        required: true,
        unique: true
    },
    imageTitle: {
        type: String,
        required: true
    },
    linkTo: String
});

exports.Banner = Mongoose.model('Banner', bannerSchema);