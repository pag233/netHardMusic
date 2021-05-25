const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, emailValidate } = require('../db_mongo/module/user');

router.delete('/', function (req, res) {
    try {
        req.session.destroy();
        return res.json({ status: 'done' });
    } catch (error) {
        return res.json({ error });
    }
});

router.post('/', async function (req, res) {
    const { error } = emailValidate({ email: req.body.email });
    if (error) {
        return res.status(401).json({ error: "邮箱格式错误" });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).json({ error: "用户名或密码错误" });
    }
    const token = jwt.sign({ _id: user._id, username: user.username }, req.app.locals.key, {
        expiresIn: "30 days"
    });
    console.log(token);
    res.setHeader('x-auth-token', token);
    return res.json({ status: 'done', avatarURL: user.avatarURL });
});

module.exports = router;