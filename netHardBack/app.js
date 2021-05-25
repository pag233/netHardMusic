const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');

const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

//api
const authRouter = require('./api/auth');
const userRouter = require('./api/user');
const bannerRouter = require('./api/banner');
const songlistRouter = require('./api/songlist');
const searchRouter = require('./api/search');
const songRouter = require('./api/song');
const privateContentRouter = require('./api/privatecontent');
const topicsRouter = require('./api/topics');
const messageRouter = require('./api/message');

const app = express();

//db默认链接字符串
const MongoDBConnectionString = process.env.MongoDBConnectionString || 'mongodb://localhost:27017/netHardMusic';
mongoose.connect(MongoDBConnectionString, {
  useNewUrlParser: true,
  useFindAndModify: false,
}).then(() => {
  console.log('!!!DB connected!!!');
}).catch(console.error);

//跨源配置
const origin = process.env.ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin,
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['x-auth-token']
}));
//中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(session({
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  secret: process.env.PrivateKey,
  saveUninitialized: false,
  resave: false
}));

app.use('/banner', bannerRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/songlist', songlistRouter);
app.use('/search', searchRouter);
app.use('/song', songRouter);
app.use('/privatecontent', privateContentRouter);
app.use('/topics', topicsRouter);
app.use('/message', messageRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.end('error');
});
module.exports = app;