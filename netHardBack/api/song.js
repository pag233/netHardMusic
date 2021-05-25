const express = require('express');
const router = express.Router();
const { Song } = require('../db_mongo/module/song');

//fake
router.get('/lastest', async function (req, res) {
    const { limit = 10 } = req.query;
    const latestSongs = await Song.find({}).sort({
        createdAt: -1
    }).limit(limit);
    res.json({ latestSongs });
});

module.exports = router;