
import express from "express";
import {
    watch, 
    getEdit, 
    getUpload,
    postUpload, 
    deleteVideo,
    postEdit,
} from "../controllers/videoController";


const videoRouter = express.Router();

videoRouter.route("/upload")
           .get(getUpload)
           .post(postUpload);

videoRouter.get("/:id([0-9a-f]{24})", watch);

videoRouter.route("/:id([0-9a-f]{24})/edit")
           .get(getEdit)
           .post(postEdit); // 하나의 url에 post, get request 할 때 사용하는 표현


videoRouter.get("/:id(\\d+)/delete", deleteVideo);

export default videoRouter;


// id를 숫자만 되게 하려면
// videoRouter.get("/:id(\\d+)", see); 이렇게 하면 된다
//mongodb의 id는 24자리의 hex 숫자임 => 정규식 [0-9a-f]{24}로 매칭해주면 된다.