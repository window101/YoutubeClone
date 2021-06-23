
import express from "express";
import {see, edit, upload, deleteVideo} from "../controllers/videoController";


const videoRouter = express.Router();

videoRouter.get("/upload", upload);
videoRouter.get("/:id(\\d+)", see);
videoRouter.get("/:id(\\d+)/edit", edit);
videoRouter.get("/:id(\\d+)/delete", deleteVideo);

export default videoRouter;


// id를 숫자만 되게 하려면
// videoRouter.get("/:id(\\d+)", see); 이렇게 하면 된다