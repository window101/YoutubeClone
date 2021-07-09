
// api는 백엔드가 템플릿을 렌더링 하지 않을 때, 프론트와 백엔드가 통신하는 방법을 말한다

import express from "express";
import { registerView } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);

export default apiRouter;


/*

client 부분에서 영상이 끝나는 시점에 이벤트를 걸어서

fetch(`/api/videos/${id}/view`, {
    method: "POST",
})

와 같이 백엔드에 조회수 api 요청 보낼 수 있음

*/