const mongoose = require('mongoose');

const privateMessageSessionDataSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    user: mongoose.Types.ObjectId,
}, { timestamps: true });

const privateMessageDataListSchema = new mongoose.Schema({
    data: [privateMessageSessionDataSchema],
    sessionGroup: [{
        type: mongoose.Types.ObjectId,
        ref: "PrivateMessageSession"
    }]
}, { timestamps: true });

const privateMessageSessionSchema = new mongoose.Schema({
    talkingTo: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    newMessage: {
        type: Number,
        default: 0,
        min: 0
    },
    dataRef: {
        type: mongoose.Types.ObjectId,
        ref: "PrivateMessageDataList",
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const atMessageSchema = new mongoose.Schema({
    songlist: {
        type: mongoose.Types.ObjectId,
        ref: "Songlist"
    },
    commentId: {
        type: mongoose.Types.ObjectId,
        required: true,
    }
});

const messageListSchema = new mongoose.Schema({
    privateMessageSession: [{
        type: mongoose.Types.ObjectId,
        ref: "PrivateMessageSession",
    }],
    atMessageList: [{
        type: mongoose.Types.ObjectId,
        ref: "AtMessage",
    }],
    newPrivateMessage: {
        type: Number,
        default: 0,
        min: 0
    },
    newCommentMessage: {
        type: Number,
        default: 0,
        min: 0
    },
    newAtMessage: {
        type: Number,
        default: 0,
        min: 0
    },
    newNoticeMessage: {
        type: Number,
        default: 0,
        min: 0
    },
});
messageListSchema.virtual('totalNewMessage').get(function () {
    return this.newPrivateMessage + this.newCommentMessage + this.newAtMessage + this.newNoticeMessage;
});

messageListSchema.methods.readAll = function () {
    this.newPrivateMessage = 0;
    this.newCommentMessage = 0;
    this.newAtMessage = 0;
    this.newNoticeMessage = 0;
};


exports.PrivateMessageSessionData = mongoose.model('PrivateMessageSessionData', privateMessageSessionDataSchema);
exports.PrivateMessageDataList = mongoose.model('PrivateMessageDataList', privateMessageDataListSchema);
exports.PrivateMessageSession = mongoose.model('PrivateMessageSession', privateMessageSessionSchema);

exports.AtMessage = mongoose.model('AtMessage', atMessageSchema);

exports.MessageList = mongoose.model('MessageList', messageListSchema);