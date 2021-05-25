const express = require('express');
const router = express.Router();

const fs = require('fs');
const multer = require('multer');

const { User } = require('../../db_mongo/module/user');
const tokenVerify = require('../common/token');
const imageUploader = require('../common/imageUploader');

const avatarDest = '/images/avatars/';

//请求体中的键名必须与传递给single函数的值一致。
const avatarUploader = imageUploader(avatarDest).single('avatar');

router.post('/', tokenVerify, async function (req, res) {
    avatarUploader(req, res, async err => {
        if (!err) {
            try {
                const avatarURL = avatarDest + req.file.filename;
                const result = await User.findByIdAndUpdate({ _id: res.locals.identity._id }, { avatarURL });
                if (result.avatarURL) {
                    fs.unlinkSync(res.app.locals.fileServer + result.avatarURL.split('/').slice(1).join('/'));
                }
                return res.json({ status: 'done', avatarURL });
            } catch (error) {
                console.error(error);
                return res.json({ error });
            }
        }
        else {
            console.error(err);
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: '文件大小超过限制' });
                }
            } else {
                return res.status(500).json({ error: '修改头像失败' });
            }
        }
    });
});


module.exports = router;