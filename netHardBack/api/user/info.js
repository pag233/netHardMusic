const express = require('express');

const mongoose = require('mongoose');
const { User, usernameValidate } = require('../../db_mongo/module/user');

const router = express.Router();

router.get('/', async function (req, res) {
    const { username, type = "info" } = req.query;
    const { error } = usernameValidate(username);
    if (error) {
        return res.json({ error: '用户名错误' });
    }
    let user = await User.findOne({
        username
    });
    if (!user) return res.status(400).json({ error: '用户不存在' });
    user = await user.populate({
        path: 'songlists',
        populate: 'tracks'
    }).populate({
        path: 'favSonglists',
        populate: 'tracks'
    }).execPopulate();

    return res.json({
        status: 'done',
        ...user.info,
        username: user.username,
        avatarURL: user.avatarURL,
        songlists: type === "detail" ? user.songlists : undefined,
        favSonglists: type === "detail" ? user.favSonglists : undefined,
    });
});

module.exports = router;