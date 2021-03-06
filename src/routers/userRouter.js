
import express from "express";
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload} from "../middlewares.js";
import {
    getEdit, 
    postEdit,
    remove, 
    logout, 
    see, 
    startGithubLogin, 
    finishGithubLogin,
    getChangePassword,
    postChangePassword} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);

userRouter
    .route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(avatarUpload.single("avatar"), postEdit); // all : 모든 method에 적용, req.file 접근가능

userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);

userRouter.get("/remove", remove);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/:id", see);

export default userRouter;

