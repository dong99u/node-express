require("dotenv").config();
require("./db");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const session = require("express-session"); // express-session 미들웨어를 가져와 사용자 세션을 관리합니다.
const MongoStore = require("connect-mongo"); // MongoDB에 세션 데이터를 저장하기 위해 connect-mongo를 가져옵니다.
const pug = require("pug");

// Routers
const letterRouter = require("./routes/letterRouter.js");
const loginRouter = require("./routes/loginRouter.js");
const profileRouter = require("./routes/profileRouter.js");
const bannedWordRouter = require("./routes/bannedWordRouter.js");
const diaryRouter = require("./routes/diaryRouter.js");
const userRouter = require("./routes/userRouter.js");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 요청 본문에서 들어오는 URL 인코딩 데이터를 구문 분석합니다.
app.use("/img/uploads", express.static(`${__dirname}/uploads`)); // uploads 폴더를 정적 경로로 추가
app.use(cookieParser());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// 세션 미들웨어 설정: express-session 미들웨어를 사용하려면 먼저 앱에 세션 미들웨어를 추가해야 합니다.
app.use(
	// session middleware 를추가. router 앞에 설정해야함!
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24,
		}, // 24 hours 쿠키 유지시간
		store: MongoStore.create({
			mongoUrl: process.env.DB_URL,
		}),
	})
);

app.use("/", loginRouter);
app.use("/letters", letterRouter);
app.use("/profile", profileRouter);
app.use("/diary", diaryRouter);
app.use("/bannedWord", bannedWordRouter);
app.use("/user", userRouter);

// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
