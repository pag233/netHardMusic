const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const InfoRouter = require('./user/info');
const AvatarRouter = require('./user/avatar');
const SongListRouter = require('./user/songlist');

const { User, validate } = require('../db_mongo/module/user');
const { Songlist } = require('../db_mongo/module/songlist');
const { MessageList } = require('../db_mongo/module/message');
router.use('/info', InfoRouter);
router.use('/avatar', AvatarRouter);
router.use('/songlist', SongListRouter);

router.post('/', async function (req, res, next) {
    try {
        //验证用户信息格式
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        //判断用户是否已注册
        let user = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
        if (user) {
            return res.status(400).json({ error: '邮箱或用户名已被使用' });
        } else {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);
            user = new User({
                email: req.body.email,
                username: req.body.username,
                password,
            });
            user.on('index', error => {
                console.log(error);
            });
            //添加默认歌单
            const songlist = new Songlist({
                name: "我喜欢的音乐",
                private: true,
                icon: 'fav',
                created_by: user._id,
                deleteable: false
            });
            const error = await songlist.validate();
            if (error) {
                res.status(400).json({ error });
            }
            user.songlists.push(songlist._id);
            user.favSongs = songlist._id;

            const message = new MessageList();
            user.message = message;
            await message.save();
            await songlist.save();
            await user.save();
            return res.json({ status: "done" });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error._message });
    }
});

module.exports = router;