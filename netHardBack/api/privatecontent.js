const express = require('express');
const router = express.Router();

const PrivateContent = require('../db_mongo/module/privatecontent');
//fake
router.get('/', async function (req, res) {
    const contents = await PrivateContent.find({}, { __v: 0 });
    return res.json({ status: 'done', contents });
});

module.exports = router;