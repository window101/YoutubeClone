

export const trending = (req, res) => {
    res.render("home", {pageTitle : "Home"});
}
export const see = (req, res) => {
    
    res.render("watch");
}
export const getEdit = (req, res) => {
    
    res.render("edit");
}
export const postEdit = (req, res) => {
    const {id} = req.params;
    const {title} = req.body;
    return res.redirect(`/videos/${id}`);
}


export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => {
    console.log(req.params);
    return res.send("Delete Video");
}

export const getUpload = (req, res) => {
    return res.render("upload");
}
export const postUpload = (req, res) => {
    return res.redirect("/");
}
