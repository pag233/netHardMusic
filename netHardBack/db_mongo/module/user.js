const Joi = require('joi');
const mongoose = require('mongoose');
const { usernamePattern } = require('../../api/common/regexpPatterns');
const emailSchema = Joi.string().trim().min(5).max(255).required().email()
    .error(errors => (
        errors.map(err => {
            console.log(err.code);
            if (err.code === 'string.empty' || err.code === 'any.required') {
                err.message = '邮箱不能为空';
            } else {
                err.message = '邮箱格式错误';
            }
            return err;
        })
    ));

const emailValidate = email => (
    Joi.object({
        email: emailSchema
    }).validate(email)
);

const usernameSchema = Joi.string().trim().min(1).max(32).required()
    .pattern(usernamePattern)
    .error(errors => (
        errors.map(err => {
            console.log(err.code);
            if (err.code === 'string.empty' || err.code === 'any.required') {
                err.message = '用户昵称不能为空';
            } else if (err.code === 'string.pattern.base') {
                err.message === '用户昵称不能包括除英文、汉字、@#_以外的字符';
            }
            else {
                err.message = '用户昵称格式错误';
            }
            return err;
        })
    ));
const usernameValidate = username => (
    usernameSchema.validate(username)
);

const infoSchema = Joi.object({
    description: Joi.string().trim().allow(null, '').max(300),
    gender: Joi.string().valid('0', '1', '2'),
    birth: Joi.date().less('now').greater('1-1-1900').timestamp(),
    province: Joi.string().min(0).max(12),
    city: Joi.string().min(0).max(12),
});

const infoValidate = info => {
    return Joi.object({
        username: usernameSchema,
        info: infoSchema
    }).validate(info);
};


const userSchema = Joi.object(
    {
        email: emailSchema,
        username: usernameSchema,
        password: Joi.string().min(8).max(2048).trim().pattern(/^[a-zA-Z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]{8,2048}$/).required()
            .error(errors => (
                errors.map(err => {
                    console.log(err.code);
                    if (err.code === 'string.empty' || err.code === 'any.required') {
                        err.message = '密码不能为空';
                    } else {
                        err.message = '密码格式错误';
                    }
                    return err;
                })
            )),
    }
);

const validate = user => (
    userSchema.validate(user)
);

const mongooseUserSchema = new mongoose.Schema({
    email: {
        type: String,
        min: 5,
        max: 255,
        required: true,
        index: true,
        unique: true
    },
    username: {
        type: String,
        min: 1,
        max: 32,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        min: 8,
        max: 2048,
        required: true
    },
    avatarURL: String,
    avatarId: Number,
    favSongs: { type: mongoose.Types.ObjectId, ref: "Songlist" },
    songlists: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Songlist"
        }
    ],
    favSonglists: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Songlist"
        }
    ],
    info: {
        type: Object,
        default: {}
    },
    message: { type: mongoose.Types.ObjectId, ref: "MessageList" }
});

exports.User = mongoose.model('User', mongooseUserSchema);
exports.validate = validate;
exports.usernameValidate = usernameValidate;
exports.emailValidate = emailValidate;
exports.infoValidate = infoValidate;