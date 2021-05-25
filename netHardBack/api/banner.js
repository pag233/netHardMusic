const express = require('express');
const router = express.Router();
const { Banner } = require('../db_mongo/module/banners');

async function getBanners() {
    return Banner.find({}, { _id: 0, _v: 0 });
}

router.get('/', async function (req, res, next) {
    try {
        const banners = await getBanners();
        return res.json({ banners });
    } catch (error) {
        console.error(error);
        return res.json({ error: '获取banner错误' });
    }
});

module.exports = router;