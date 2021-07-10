
import express from "express";
import {
    watch, 
    getEdit, 
    getUpload,
    postUpload, 
    deleteVideo,
    postEdit,
    
} from "../controllers/videoController.js";
import { protectorMiddleware, videoUpload } from "../middlewares.js";


const videoRouter = express.Router();

videoRouter.route("/upload")
           .all(protectorMiddleware)
           .get(getUpload)
           .post(videoUpload.single("video"), postUpload);

videoRouter.get("/:id([0-9a-f]{24})", watch);

videoRouter.route("/:id([0-9a-f]{24})/edit")
           .all(protectorMiddleware)
           .get(getEdit)
           .post(postEdit); // 하나의 url에 post, get request 할 때 사용하는 표현

videoRouter.route("/:id([0-9a-f]{24})/delete")
            .all(protectorMiddleware)
            .get(deleteVideo);


//videoRouter.get("/:id(\\d+)/delete", deleteVideo);

export default videoRouter;


// id를 숫자만 되게 하려면
// videoRouter.get("/:id(\\d+)", see); 이렇게 하면 된다
//mongodb의 id는 24자리의 hex 숫자임 => 정규식 [0-9a-f]{24}로 매칭해주면 된다.