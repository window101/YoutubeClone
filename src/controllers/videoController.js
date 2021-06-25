
import Video from "../models/Video";

/* callback 방식
Video.find({}, (error, videos) => {
    if(error) {
        return res.render("server-error");
    }
    return res.render("home", { pageTitle : "Home", videos});
});

*/

export const home = async (req, res) => {
    const videos = await Video.find({});
    //console.log(videos);
    return res.render("home", {pageTitle: "Home", videos});
}

export const watch = async (req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id);
    if(video) {
        return res.render("watch", {pageTitle : video.title, video });
    }
    return res.render("404", {pageTitle:"Video not found."});
}

export const getEdit = async (req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video) {
        return res.render("404", {pageTitle: "Video not found." });
    }
    return res.render("edit", {pageTitle : `Edit ${video.title}`, video });
}

export const postEdit = async (req, res) => {
    const {id} = req.params;
    const {title, description, hashtags} = req.body;
    const video = await Video.exists({ _id: id}); //_id : mongodb의 id 형식
    if(!video) {
        return res.render("404", {pageTitle: "Video not found."});
    }

    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags,
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


export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => {
    console.log(req.params);
    return res.send("Delete Video");
}

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video "});
}

export const postUpload = async (req, res) => {
    const { title, description, hashtags } = req.body;
    console.log(title, description, hashtags);

    try {
        await Video.create({
            title,
            description,
            hashtags,
           
        });
        
        return res.redirect("/");
    }catch(error) {
        //console.log(error);
        return res.render("upload", {
            pageTitle : "Upload Video", 
            errorMessage: error._message
        });
    }
};
