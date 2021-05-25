const express = require('express');
const router = express.Router();
const fs = require('fs');

const mongoose = require('mongoose');

const songTags = require('./common/tags');
const imageUploader = require('./common/imageUploader');
const tokenVerify = require('./common/token');
const { Songlist } = require('../db_mongo/module/songlist');
const { Song } = require('../db_mongo/module/song');
const { User } = require('../db_mongo/module/user');
const { Comment, CommentThread } = require('../db_mongo/module/commentThread');
const { MessageList, AtMessage } = require('../db_mongo/module/message');

router.delete('/', tokenVerify, async function (req, res) {
    let { songlist_id } = req.body;
    const { _id } = res.locals.identity;
    try {
        songlist_id = mongoose.Types.ObjectId(songlist_id);
    } catch (error) {
        return res.status(400).json({
            error: '歌单id错误'
        });
    }
    try {
        const result = await User.findOneAndUpdate({ _id }, {
            $pull: { songlists: songlist_id }
        }, {
            new: false
        });
        if (result.songlists.includes(songlist_id)) {
            const songlist = await Songlist.deleteOne({ _id: songlist_id });
            await CommentThread.deleteOne(songlist.commentThread);
            return res.json({ status: 'done' });
        }
        return res.status(400).json({ error: '歌单不存在' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.get('/detail', async function (req, res, next) {
    const token = req.headers['x-auth-token'];
    let { songlist_id } = req.query;
    if (!songlist_id) {
        return res.status(400).json({ error: '必须提供歌单id' });
    }
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
    } catch (error) {
        return res.status(400).json({ error: '歌单id错误' });
    }

    if (token) {
        return next();
    }

    const songlist = await (await Songlist.findOne({ _id: songlist_id }, { __v: 0 })
        .populate('created_by', {
            username: 1,
            avatarURL: 1,
        }).populate('tracks')).execPopulate();
    if (!songlist) return res.status(400).json({ error: '未找到歌单' });
    const commentThread = await CommentThread.findOne({ _id: songlist.commentThread });
    return res.json({
        status: 'done',
        ...songlist.toObject(),
        editable: false,
        favable: true,
        faved: false,
        favnum: songlist.faver.length,
        commentLength: commentThread.comments.length,
    });

}, tokenVerify, async function (req, res) {
    const { _id, username } = res.locals.identity;
    let { songlist_id, type = 'all' } = req.query;
    let songlist;
    let selectField = {
        __v: 0,
    };
    switch (type) {
        case 'all':
            let editable = false;
            let favable = true;
            let faved = false;
            songlist = await (await Songlist.findOne({ _id: songlist_id }, selectField)
                .populate('created_by', {
                    username: 1,
                    avatarURL: 1,
                }).populate('tracks')).execPopulate();
            const commentThread = await CommentThread.findOne({ _id: songlist.commentThread });
            //是否可收藏
            if (username === songlist.created_by.username) {
                favable = false;
                if (songlist.deleteable) {
                    editable = true;
                }
            } else {
                const user = await User.findById(_id);
                //是否已收藏
                if (user.favSonglists.includes(songlist_id)) {
                    faved = true;
                }
            }
            return res.json({
                status: 'done',
                ...songlist.toObject(),
                editable, favable, faved,
                favnum: songlist.faver.length,
                commentLength: commentThread.comments.length
            });
        case 'edit':
            selectField = {
                name: 1,
                tags: 1,
                description: 1,
                coverUrl: 1,
            };
            songlist = await (await Songlist.findOne({ _id: songlist_id }, selectField)).execPopulate();
            return res.json({ status: 'done', ...songlist.toObject() });
        default:
            return res.status(400).json({ error: '参数错误' });
    }
});
//更新歌单信息
router.post('/detail', tokenVerify, async function (req, res) {
    const { songlist_id, info } = req.body;
    const { name, tags, description } = info;
    if (!name) {
        return res.status(400).json({ error: '歌单名不能为空' });
    }
    const { _id } = res.locals.identity;
    const songlist = await Songlist.findById(songlist_id);
    if (songlist.created_by.toString() !== _id.toString()) {
        return res.status(401).json({
            error: '用户验证失败'
        });
    }
    if (tags) {
        if (tags.length > 3) {
            res.status(400).json({ error: '标签过多' });
        }
        tags.forEach(tag => {
            if (!tag in songTags) {
                return res.status(400).json({ error: '标签错误' });
            }
        });
    }
    const result = await songlist.updateOne({
        name, tags, description
    }, { new: true });
    if (!result) {
        return res.status(400).json({ error: '更新失败' });
    }
    return res.json({ status: 'done' });
});
router.post('/detail/play', async function (req, res, next) {
    let { songlist_id } = req.body;
    if (!songlist_id) {
        return res.status(400).json({ error: '必须提供歌单id' });
    }
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
    } catch (error) {
        return res.status(400).json({ error: '歌单id错误' });
    }
    try {
        const result = await Songlist.findByIdAndUpdate(songlist_id, {
            $inc: {
                played: 1,
            }
        }, { new: true });
        if (!result) throw new Error('更新失败');

        return res.json({ status: 'done' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }

});
// handle cover update request.
const coverDest = '/images/covers/';
const coveruUpLoader = imageUploader(coverDest).single('cover');
router.post('/detail/cover', tokenVerify, async function (req, res) {
    coveruUpLoader(req, res, async err => {
        if (!err) {
            const { songlist_id } = req.body;
            let _id;
            try {
                _id = new mongoose.Types.ObjectId(songlist_id);
            } catch (err) {
                res.status(400).json({ error: "歌单id错误" });
            }
            try {
                const coverUrl = coverDest + req.file.filename;
                const result = await Songlist.findByIdAndUpdate({ _id }, { coverUrl });
                if (result.coverUrl) {
                    fs.unlinkSync(res.app.locals.fileServer + result.coverUrl.split('/').slice(1).join('/'));
                }
                return res.json({ status: 'done', coverUrl });
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

router.post('/track', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    let { songlist_id, track_id } = req.body;
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
        track_id = new mongoose.Types.ObjectId(track_id);
    } catch (error) {
        return res.status(400).json({ error: '添加歌曲参数错误' });
    }
    try {
        const user = await (await User.findOne({
            _id
        }).populate('songlists')).execPopulate();
        let songlist = user.songlists.find(list => {
            return list._id == songlist_id.toString();
        });
        if (!songlist) {
            return res.status(400).json({ error: '歌单不存在' });
        }
        else if (songlist.tracks.includes(track_id)) {
            return res.status(400).json({ status: 'dup' });
        }
        songlist = await Songlist.findOneAndUpdate({ _id: songlist_id }, {
            $push: {
                tracks: track_id
            }
        });
        return res.json({ status: 'done' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: '添加歌曲时发生错误' });
    }
});
router.delete('/track', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    let { songlist_id, track_id } = req.body;
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
        track_id = new mongoose.Types.ObjectId(track_id);
    } catch (error) {
        return res.status(400).json({ error: '删除歌曲参数错误' });
    }
    try {
        const user = await (await User.findOne({
            _id
        }).populate('songlists')).execPopulate();
        let songlist = user.songlists.find(list => {
            return list._id == songlist_id.toString();
        });
        if (!songlist) {
            return res.status(400).json({ error: '歌单不存在' });
        }
        else if (!songlist.tracks.includes(track_id)) {
            return res.status(400).json({ error: '歌曲不存在' });
        }
        songlist = await Songlist.findOneAndUpdate({ _id: songlist_id }, {
            $pull: {
                tracks: track_id
            }
        });
        return res.json({ status: 'done' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: '添加歌曲时发生错误' });
    }
});
router.get('/comment', async function (req, res) {
    let { songlist_id, limit = 10, offset = 0 } = req.query;
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
    } catch (error) {
        return res.status(400).json({ error: '歌单id错误' });
    }
    const result = await (await Songlist.findOne({
        _id: songlist_id
    })
        .populate({
            path: 'commentThread',
            populate: {
                path: 'comments',
                populate: {
                    path: 'user',
                    select: {
                        username: 1,
                        avatarURL: 1,
                    }
                },
            }
        }))
        .execPopulate();

    const resultComments = result.commentThread.comments;
    const comments = resultComments.toObject().map(comment => {
        if (comment.replyTo) {
            comment.replyTo = resultComments.find(c => c._id.toString() === comment.replyTo.toString());
        }
        return comment;
    }).reverse();

    const featuredComments = comments.filter(comment => comment.like > 99).slice(0, 10);

    res.json({
        comments: comments.slice(Number(offset), Number(offset + limit)),
        featuredComments,
        status: 'done',
        total: result.commentThread.comments.length,
    });
});

const atPattern = /.+?( |$)/gi;

router.post('/comment', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    let { songlist_id, comment, replyTo } = req.body;
    if (!comment) {
        return res.status(400).json({ error: '评论不能为空' });
    }
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
        replyTo = replyTo && new mongoose.Types.ObjectId(replyTo);
    } catch (error) {
        return res.status(400).json({ error: '歌单id错误' });
    }
    try {
        //保存评论
        const songlist = await Songlist.findOne({ _id: songlist_id });
        const { commentThread: ct_id } = songlist;
        const commentThread = await CommentThread.findOne({ _id: ct_id });
        const newComment = new Comment({
            comment,
            user: _id,
            replyTo
        });
        commentThread.comments.push(newComment);
        await commentThread.save();
        let result = await newComment.populate({
            path: 'user',
            select: {
                username: 1,
                avatarURL: 1
            },
        }).execPopulate();

        result = result.toObject();
        if (replyTo) {
            replyTo = commentThread.comments.find(comment => comment._id.toString() === replyTo.toString());
            replyToUser = await User.findById(replyTo.user, "username avatarURL");
            replyTo.user = replyToUser;
            result.replyTo = replyTo;
        }
        //增加通知信息数量
        if (songlist.created_by.toString() !== _id.toString()) {
            const user = await User.findById(songlist.created_by, ['message']);
            const messagelist = await MessageList.findById(user.message, ['newCommentMessage']);
            messagelist.newCommentMessage++;
            await messagelist.save();
        }
        //增加at信息通知
        if (comment.includes('@')) {
            const usernames = comment.match(atPattern)
                .filter(words => words.includes('@'))
                .map(username => ({
                    username: username.slice(1).trim()
                }));
            const users = await User.find({
                $or: usernames,
            }, ['message']);
            const messageLists = await MessageList.find({
                $or: users.map(user => ({ _id: user.message }))
            });
            const atMessage = new AtMessage({
                songlist: songlist._id,
                commentId: newComment._id
            });
            await Promise.all(messageLists.map(list => list.updateOne({
                $inc: { newAtMessage: 1 },
                $push: {
                    atMessageList: atMessage._id
                },
            })));
            await atMessage.save();
        }
        return res.json({ status: 'done', comment: result, total: commentThread.comments.length });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: '评论时出现错误' });
    }
});
router.patch('/comment', tokenVerify, async function (req, res) {
    let { songlist_id, comment_id } = req.body;
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
        comment_id = new mongoose.Types.ObjectId(comment_id);
        const songlist = await Songlist.findOne({ _id: songlist_id });
        const result = await CommentThread.findOneAndUpdate({ _id: songlist.commentThread, "comments._id": comment_id }, {
            $inc: { "comments.$.like": 1 }
        }, { new: true });
        if (!result) {
            return res.status(400).json({ error: '点赞评论失败' });
        }
        return res.json({ status: 'done' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: '点赞评论未知错误' });
    }

});

router.get('/follower', async function (req, res) {
    let { songlist_id } = req.query;
    try {
        songlist_id = new mongoose.Types.ObjectId(songlist_id);
    } catch (error) {
        return res.status(400).json({ error: '歌单id错误' });
    }
    const songlist = await (await Songlist.findOne({ _id: songlist_id })).populate('faver', {
        username: 1,
        avatarURL: 1,
        info: {
            description: 1,
            gender: 1
        },
    }).execPopulate();
    return res.json({ status: 'done', follower: songlist.faver });
});

/*
* fake
*/
router.get('/recommand', async function (req, res) {
    const { limit = 10 } = req.query;
    const songlists = await Songlist.find({ private: false }, {
        name: 1,
        coverUrl: 1,
        icon: 1,
    }).limit(Number(limit));
    return res.json(songlists);
});


module.exports = router;