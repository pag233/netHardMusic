const express = require('express');
const router = express.Router();

const tokenVerify = require('./common/token');
const mongoose = require('mongoose');
const { User } = require('../db_mongo/module/user');
const { MessageList, PrivateMessageSession, PrivateMessageDataList, PrivateMessageSessionData } = require('../db_mongo/module/message');
const { usernamePattern } = require('./common/regexpPatterns');
//一键阅读
router.get('/all', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    const user = await User.findById(_id);
    const messageList = await MessageList.findById(user.message);
    messageList.readAll();
    const sessions = await PrivateMessageSession.find({
        _id: {
            $in: messageList.privateMessageSession
        }
    });
    await Promise.all(sessions.map(session => {
        session.newMessage = 0;
        return session.save();
    }));
    await messageList.save();
    return res.json({ status: 'done' });
});

//私信
router.get('/privateMessage', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    const user = await (await User.findOne({
        _id,
    })).populate({
        path: 'message',
        populate: {
            path: 'privateMessageSession',
            match: {
                isDelete: false
            },
            populate: {
                path: 'dataRef talkingTo',
                select: {
                    username: 1,
                    avatarURL: 1,
                    lastMessage: {
                        $last: { $ifNull: ["$data", []] }
                    },
                    newMessage: 1
                }
            },
        }
    }).execPopulate();
    return res.json({ status: 'done', privateMessageList: user.message.privateMessageSession });
});

router.get('/privateMessage/data', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    let { userId: toUserId } = req.query;
    try {
        toUserId = new mongoose.Types.ObjectId(toUserId);
    } catch (error) {
        res.status(400).json({ error: '数据列表id错误' });
    }
    const fromUser = await (await User.findById(_id)).populate({
        path: 'message',
        populate: 'privateMessageSession'
    }).execPopulate();
    let session = fromUser.message.privateMessageSession.find(session => session.talkingTo.toString() === toUserId.toString());
    if (session) {
        session = await (await PrivateMessageSession.findById(session._id)).populate('dataRef').execPopulate();
        const fromUserMessageList = await MessageList.findById(fromUser.message);
        fromUserMessageList.newPrivateMessage -= session.newMessage;
        session.newMessage = 0;
        await fromUserMessageList.save();
        await session.save();
        return res.json({ status: 'done', data: session.dataRef.data });
    }
    return res.json({ status: 'done', data: [] });
});

router.post('/privateMessage/data', tokenVerify, async function (req, res) {
    const { _id: fromUserId } = res.locals.identity;
    let { userId: toUserId, message } = req.body;

    try {
        toUserId = new mongoose.Types.ObjectId(toUserId);
    } catch (error) {
        return res.status(400).json({ error: '私信id或用户id格式错误' });
    }

    let sessionData = new PrivateMessageSessionData({
        message,
        user: fromUserId
    });

    const fromUser = await User.findOne({ _id: fromUserId });
    const toUser = await (await User.findOne({ _id: toUserId })).populate({
        path: 'message',
        populate: {
            path: 'privateMessageSession',
        }
    }).execPopulate();

    let toUserPrivateMessageSession = toUser.message.privateMessageSession.find(session => session.talkingTo.toString() === fromUserId);

    if (!toUserPrivateMessageSession) {
        const privateMessageDataList = new PrivateMessageDataList({
            data: [sessionData]
        });
        const fromUserPrivateMessageSession = new PrivateMessageSession({
            talkingTo: toUserId,
            dataRef: privateMessageDataList._id
        });
        toUserPrivateMessageSession = new PrivateMessageSession({
            talkingTo: fromUserId,
            newMessage: 1,
            dataRef: privateMessageDataList._id
        });
        privateMessageDataList.sessionGroup = [fromUserPrivateMessageSession._id, toUserPrivateMessageSession._id];

        const fromUserMessageList = await MessageList.findById(fromUser.message);
        const toUserMessageList = await MessageList.findById(toUser.message);

        fromUserMessageList.privateMessageSession.push(fromUserPrivateMessageSession);
        toUserMessageList.privateMessageSession.push(toUserPrivateMessageSession);
        toUserMessageList.newPrivateMessage++;

        await privateMessageDataList.save();
        await fromUserPrivateMessageSession.save();
        await toUserPrivateMessageSession.save();
        await fromUserMessageList.save();
        await toUserMessageList.save();

    } else {
        console.log('find session');
        const privateMessageDataList = await PrivateMessageDataList.findById(toUserPrivateMessageSession.dataRef);
        privateMessageDataList.data.push(sessionData);
        await privateMessageDataList.save();

        toUserPrivateMessageSession = await PrivateMessageSession.findById(toUserPrivateMessageSession._id);
        toUserPrivateMessageSession.isDelete = false;
        toUserPrivateMessageSession.newMessage++;
        await toUserPrivateMessageSession.save();

        const fromUserPrivateMessageSessionId = privateMessageDataList.sessionGroup.find(session => session.toString() !== toUserPrivateMessageSession._id.toString());
        const fromUserPrivateMessageSession = await PrivateMessageSession.findById(fromUserPrivateMessageSessionId);
        fromUserPrivateMessageSession.isDelete = false;
        await fromUserPrivateMessageSession.save();

        const toUserMessageList = await MessageList.findById(toUser.message);
        toUserMessageList.newPrivateMessage++;
        await toUserMessageList.save();
    }
    sessionData = sessionData.toObject();
    sessionData.updatedAt = new Date().toISOString();
    return res.json({ status: 'done', sessionData, dataListId: toUserPrivateMessageSession.dataRef });
});

router.get('/newMessageCount', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    const user = await (await User.findById(_id)).populate('message').execPopulate();
    return res.json({
        status: 'done',
        totalNewMessage: user.message.totalNewMessage,
        newMessages: {
            privateMessage: user.message.newPrivateMessage,
            comment: user.message.newCommentMessage,
            at: user.message.newAtMessage,
            notice: user.message.newNoticeMessage,
        }
    });
});

//评论
const fetchCommentLength = 10;
router.get('/commentMessage', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    const { offset = 0 } = req.query;
    const user = await (await User.findById(_id)).populate({
        path: 'songlists',
        populate: {
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
        }
    }).execPopulate();

    const messageList = await MessageList.findById(user.message);
    messageList.newCommentMessage = 0;
    await messageList.save();

    const comments = user.toObject().songlists.map(list => {
        if (list.commentThread.comments.length > 0) {
            const comments = [...list.commentThread.comments];
            return comments.map((comment, key) => {
                if (key === 0) {
                    //标记末尾评论
                    comment.end = true;
                }
                comment.songlist = {
                    _id: list._id, name: list.name, offset: Math.floor(offset / fetchCommentLength)
                };
                if (comment.replyTo) {
                    comment.replyTo = comments.find(c => c._id.toString() === comment.replyTo.toString());
                }
                return comment;
            });
        }
    })
        .reduce((pre, cur) => (
            cur ? [...pre, ...cur] : pre
        ), []).sort((a, b) => (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
    return res.json({ status: 'done', message: comments.slice(offset, offset + fetchCommentLength) });
});

router.get('/atMessage', tokenVerify, async function (req, res) {
    const { _id } = res.locals.identity;
    const { offset = 0 } = req.query;
    const user = await User.findById(_id, 'message');

    let messageList = await (await MessageList.findById(user.message)).populate({
        path: 'atMessageList',
        populate: {
            path: 'songlist',
            select: 'commentThread coverUrl name created_by',
            populate: {
                path: 'commentThread created_by',
                select: "comments username"
            }
        }
    }).execPopulate();
    messageList.newAtMessage = 0;
    await messageList.save();

    let atMessageList = messageList.atMessageList.toObject();

    atMessageList = atMessageList.map(atList => ({
        _id: atList._id,
        comments: atList.songlist.commentThread.comments.find(comment => comment._id.toString() === atList.commentId.toString()),
        songlist: {
            _id: atList.songlist._id,
            by: atList.songlist.created_by,
            coverUrl: atList.songlist.coverUrl,
            name: atList.songlist.name,
            offset: Math.floor(offset / fetchCommentLength)
        }
    }));

    if (atMessageList.length === 0) {
        return res.json({ status: 'done', message: [] });
    }

    const users = await User.find({
        $or: atMessageList.map(atList => ({ _id: atList.comments.user }))
    }, "username avatarURL");

    atMessageList.forEach((atList, key) => {
        atList.comments.user = users.find(user => user._id.toString() === atList.comments.user.toString());
        if (key === 0) {
            atList.end = true;
        }
    });

    return res.json({ status: 'done', message: atMessageList.reverse().slice(offset, offset + fetchCommentLength) });
});
module.exports = router;