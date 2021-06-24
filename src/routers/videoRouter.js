
import express from "express";
import {
    see, 
    getEdit, 
    upload, 
    deleteVideo,
    postEdit,
} from "../controllers/videoController";


const videoRouter = express.Router();

videoRouter.get("/upload", upload);
videoRouter.get("/:id(\\d+)", see);
videoRouter.route("/:id(\\d+)/edit")
           .get(getEdit)
           .post(postEdit); // 하나의 url에 post, get request 할 때 사용하는 표현


videoRouter.get("/:id(\\d+)/delete", deleteVideo);

export default videoRouter;


// id를 숫자만 되게 하려면
// videoRouter.get("/:id(\\d+)", see); 이렇게 하면 된다