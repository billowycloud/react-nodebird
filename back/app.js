const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const hpp = require('hpp');
const helmet = require('helmet');

const passportConfig = require('./passport');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const hashtagRouter = require('./routes/hashtag');

const db = require('./models');

dotenv.config();
const app = express();

db.sequelize
  .sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);
passportConfig();

// Body
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
} else {
  app.use(morgan('dev'));
}
app.use(
  cors({
    origin: 'http://localhost:3000', // true 도 가능
    credentials: true, // 쿠키 전달 시
  })
);
app.use('/', express.static(path.join(__dirname, 'uploads'))); // 폴더 제공
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/hashtag', hashtagRouter);

// 에러처리 미들웨어 : 기본적으로 들어있지만 특정 에레피이지같은 커스텀이 필요하면 아래와 같이 따로 만들어 줘야함
// app.use((err, req, res, next) => {});

app.listen(4000, () => {
  console.log('서버 실행 중!');
});
