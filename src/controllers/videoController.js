
import Video from "../models/Video.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

/* callback 방식
Video.find({}, (error, videos) => {
    if(error) {
        return res.render("server-error");
    }
    return res.render("home", { pageTitle : "Home", videos});
});

*/

export const home = async (req, res) => {
    const videos = await Video.find({}).sort({ createdAt: "desc"});
    //console.log(videos);
    return res.render("home", {pageTitle: "Home", videos});
}

export const watch = async (req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id).populate("owner");
    //const owner = await User.findById(video.owner);
    //console.log(owner);
    console.log(video);
    if(!video) {
        return res.status(404).render("404", {pageTitle:"Video not found."});
    }
    return res.render("watch", {pageTitle : video.title, video });
    
}

export const getEdit = async (req, res) => {
    const {id} = req.params;
    const {user : {_id}} = req.session;
    const video = await Video.findById(id);
    if(!video) {
        return res.status(404).render("404", {pageTitle: "Video not found." });
    }
    
    if(String(video.owner) !== String(_id)) { // 영상의 owner가 아니라면 edit 페이지를 보여주지 않는다. 
        req.flash("error", "Not authorized");
        return res.status(403).redirect("/");
    }

    return res.render("edit", {pageTitle : `Edit ${video.title}`, video });
}

export const postEdit = async (req, res) => {
    const {
        user : {_id},
    } = req.session;

    const {id} = req.params;
    const {title, description, hashtags} = req.body;
    const video = await Video.exists({ _id: id}); //_id : mongodb의 id 형식
    if(!video) {
        return res.status(404).render("404", {pageTitle: "Video not found."});
    }
    if(String(video.owner) !== String(_id)) { // 영상의 owner가 아니라면 edit 페이지를 보여주지 않는다. 
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags:Video.formatHashtags(hashtags),
    });
    /* 이렇게도 할 수 있다
    video.title = title;
    video.description = description;
    video.hashtags = hashtags
        .split(",")
        .map((word) => (word.startsWith('#') ? word : `#${word}`));
    await video.save();
    */
    return res.redirect(`/videos/${id}`);
}


export const search = async (req, res) => {

    //console.log(req.query);
    const { keyword } = req.query;
    let videos = [];
    if(keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(`${keyword}$`, "i") // keyword로 끝나는 단어 검색, "i" : 대소문자 구별 안함 (정규표현식)
                                    // new RegExp( keyword ,"i") : 그냥 keyword를 포함하는 것 검색
                                    // new RegExp(`^${keyword}`, "i") : keyword로 시작하는 것 검색
            },
        });
    }
    return res.render("search", {pageTitle : "Search", videos });
};
export const upload = (req, res) => res.send("Upload");


export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video "});
}

export const postUpload = async (req, res) => {

    const {
        user: {_id}, 
    } = req.session;
    const file = req.file;
    const { title, description, hashtags } = req.body;
    console.log(title, description, hashtags);

    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl: file.path,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
           
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    }catch(error) {
        //console.log(error);
        return res.status(400).render("upload", {
            pageTitle : "Upload Video", 
            errorMessage: error._message
        });
    }
};

export const deleteVideo = async (req, res) => {
    const { id } = req.params;

    const {
        user : {_id},
    } = req.session;
    const video = await Video.findById(id);
    if(!video) {
        return res.status(404).render("404", {pageTitle: "Video not found. "});
    }
    if(String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id); // 비디오 삭제
    return res.redirect("/");
}

export const registerView = async (req, res) => {

    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video) {
        return res.sendStatus(404); // sendStatus => 상태코드만 보내고 연결 종료 시 사용, status => 연결종료가 안됨
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
}

export const createComment = async (req, res) => {
    
    const {
        session: { user },
        body: { text },
        params: { id },
    } = req;

    const video = await Video.findById(id);
    if(!video) {
        return res.sendStatus(404);
    }
    const comment = await Comment.create({
        text,
        owner: user._id, // 세션에 현재 로그인한 유저를 owner로
        video: id,
    });
    video.comments.push(comment._id);
    video.save();
    return res.status(201).json({ newCommentId: commend._id });
}

export const deleteComment = async (req, res) => {

    const {
        params: { id },
        session: {user: {_id}},
    } = req;
   
    const comment = await Comment.findById(id);
    if(!comment) {
        return res.status(400).json({ message: "comment doesn't exists." });
    }
    if(String(comment.owner) !== String(_id)) {
        return res.status(400).json({ message: "user doesn't match." });
    }
    await Comment.findByIdAndDelete(id);
    return res.sendStatus(200);

}