
import "./db"; // db.js 파일 import 하면 자동 실행됨

import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4000;
const app = express();
const logger = morgan("dev");

app.set("view engine", "pug"); // 뷰 엔진을 pug로 정의한다
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended:true}));
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);



const handleListening = () => {
    console.log(`✔️  Server Listeniung on port ${PORT}`)
}

app.listen(PORT, handleListening);
