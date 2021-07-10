
// server.js => server의 configuration에 관련된 코드만 처리

import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";

import rootRouter from "./routers/rootRouter.js";
import videoRouter from "./routers/videoRouter.js";
import userRouter from "./routers/userRouter.js";
import { localsMiddleware } from "./middlewares.js";
import apiRouter from "./routers/apiRouter.js";


const app = express();
const logger = morgan("dev");

app.set("view engine", "pug"); // 뷰 엔진을 pug로 정의한다
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended:true})); // client에서 req.body에 form 보내는거 해석
//app.use(express.text()); // client에서 req.body에 text 보내는거 해석
app.use(express.json()); // string-> js object

app.use(session({
    secret: process.env.COOKIE_SECRET, // 쿠키를 sign 함
    resave: false,
    saveUninitialized: false, // resave 조건과 함께 false를 하면 로그인한 사용자 즉, 세션을 수정한 것에 대해서만 세션을 저장
    cookie: {
        maxAge: 2000000
    },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }), // 세션을 서버 말고 mongodb에 저장
}));

/* 백엔드에 등록된 모든 세션 연결 출력(서버 -> 브라우저로 세션id 전송)
app.use((req, res, next) => {
    req.sessionStore.all((error, sessions) => {
        console.log(sessions);
        next();
    });
})
*/

app.use(flash());
app.get("/add-one", (req, res, next) => {
    return res.send(`Session id : ${req.session.id}`);
    next();
})

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); // uploads 폴더를 대중들이 볼 수 있게 한다
app.use("/assets", express.static("assets")); // webpack이 코드 변환한 assets 폴더를 공개 

app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;