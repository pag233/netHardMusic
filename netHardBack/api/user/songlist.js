const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { User, usernameValidate } = require('../../db_mongo/module/user');
const { Songlist } = require('../../db_mongo/module/songlist');
const { CommentThread } = require('../../db_mongo/module/commentThread');
const tokenVerify = require('../common/token');

router.get('/', async function (req, res) {
    const { username } = req.query;
    const { error } = usernameValidate(username);
    if (error) {
        return res.status(400).json({ error: '参数错误' });
    }

    const selectField = {
        __v: 0,
        created_by: 0,
    };

    const user = await (await User.findOne({ username }).populate({
        path: 'songlists',
        select: selectField,
        populate: {
            path: 'tracks'
        }
    })).execPopulate();
    return res.json({ songlists: user.songlists, created_by: username });
});
router.post('/', tokenVerify, async function (req, res) {
    try {
        const { _id } = res.locals.identity;
        const { name, private, tracks } = req.body;
        const commentThread = new CommentThread();
        const songlist = new Songlist({
            name, created_by: _id, private, commentThread: commentThread._id
        });
        await commentThread.save();
        const { error } = songlist.validate();
        if (error) {
            return res.status(400).json({ error });
        }
        if (tracks) {
            tracks.forEach(track => songlist.tracks.push(track));
        }
        const user = await User.findOne({ _id });
        user.songlists.push(songlist);
        await user.save();
        await songlist.save();
        return res.json({ songlist });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});
router.get('/favedlists', tokenVerify, async function (req, res) {
    let { _id } = res.locals.identity;
    const { type = 'all' } = req.query;
    try {
        _id = mongoose.Types.ObjectId(_id);
    } catch (error) {
        return res.status(400).json({ error: '用户id错误' });
    }
    let user = await User.findOne({ _id }, {
        favSonglists: 1
    });
    switch (type) {
        case 'list':
            const result = await user.populate('favSonglists', {
                name: 1
            }).execPopulate();
            return res.json({ status: 'done', favSonglists: result.favSonglists });
        case 'all':
            user = await user.populate('favSonglists', {
                __v: 0
            }).execPopulate();
            return res.json({ status: 'done', favSonglists: user.favSonglists });
        default:
            break;
    }

});
router.post('/favedlists', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    let { songlist_id } = req.body;
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
        const songlist = await Songlist.findOne({ _id: songlist_id });
        if (!songlist) return res.status(400).json({ error: '未找到歌单' });
        const user = await User.findOne({
            _id,
        }, {
            favSonglists: 1
        });
        if (user.favSonglists.includes(songlist_id)) {
            return res.json({ status: 'done' });
        }
        user.favSonglists.push(songlist_id);
        songlist.faver.push(_id);
        await songlist.save();
        await user.save();
        return res.json({ status: 'done' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});
router.delete('/favedlists', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    let { songlist_id } = req.body;
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
        const songlist = await Songlist.findOne({ _id: songlist_id });
        const user = await User.findOne({
            _id,
        }, {
            favSonglists: 1
        });
        if (!(user.favSonglists.includes(songlist_id))) {
            return res.json({ status: 'done' });
        }
        user.favSonglists = user.favSonglists.filter(id => String(id) !== String(songlist_id));
        songlist.faver = songlist.faver.filter(id => String(id) !== String(_id));
        await user.save();
        await songlist.save();
        return res.json({ status: 'done' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});
router.post('/favedTrack', tokenVerify, async function (req, res) {
    let { _id } = res.locals.identity;
    let { track_id, faved } = req.body;
    try {
        _id = new mongoose.Types.ObjectId(_id);
        track_id = new mongoose.Types.ObjectId(track_id);
    } catch (error) {
        return res.status(400).json({ error: '参数错误' });
    }
    try {
        const user = await User.findOne({
            _id
        }, {
            favSongs: 1
        });

        const opration = faved ? "$push" : "$pull";

        await Songlist.findOneAndUpdate({
            _id: user.favSongs
        }, {
            [opration]: { tracks: track_id }
        });

        return res.json({ status: 'done' });
    } catch (error) {
        return res.status(400).json({ error: '更新错误' });
    }
});
module.exports = router;