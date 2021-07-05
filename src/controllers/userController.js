
import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", {pageTitle:"Join"});
export const postJoin = async (req, res) => {
    
    const {name, username, email, password, password2, location} = req.body;
    const pageTitle = "Join";
    if(password !== password2) {
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage: "Password confirmation does not match.",
        });
    }
    const exists = await User.exists({ $or: [{username}, {email}] });
    //username, email의 중복검사 로직을 두 개 작성해도 되지만, mongoose의 or operator를 사용하면 더 효과적이다.
    if(exists) { 
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage:"This username/email is already taken."
        });
    }
    try {
        await User.create({
            name, 
            username, 
            email, 
            password,
            location,
        });
        res.redirect("/login");
    }catch(error) {
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
    
};
export const getLogin = (req, res) => {
    res.render("login", { pageTitle: "Login" });
}

export const postLogin = async (req, res) => {

    const { username, password} = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username, socialOnly: false });
    if(!user) {
        return res
            .status(400)
            .render("login", {
                pageTitle, 
                errorMessage: "An account with this username does not exists.",
            });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        return res
        .status(400)
        .render("login", {
            pageTitle, 
            errorMessage: "Wrong password.",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    //console.log(req.session);
    console.log("Successfully logged in");
    return res.redirect("/");
}

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email", //user의 어떤 정보 요청?
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);

}

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    } // user가 Github에서 돌아오면 URL에 ?code=xxxx가 덧붙여짐 => POST로 access-token 받음
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    })).json(); // access-token 반환
         
    if("access_token" in tokenRequest) {
        //access api
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json(); // Github API를 통해 User의 정보 가져옴
        console.log('user', userData);

        const emailData = await (await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json();
        console.log(emailData);
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj) {
            return res.redirect("/login");
        }
        // 만약 db에 email이 똑같은것이 발견된다면 로그인을 시켜준다
        let user = await User.findOne({ email: emailObj.email });
        if(!user) {
             user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name ? userData.name : "Unknown",
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true, // social login 으로만 할 시 설정
                location: userData.location,
            });
        } 
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
        
    }else {
        return res.redirect("/login");
    }
}

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}

export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile"});
}
export const postEdit = async (req, res) => {
    const { 
        session: { 
            user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername, name: sessionName},
         },
         body: {name, email, username, location},
         file,
    } = req;
   
    // sessionEmail = req.session.user.email
    // email = req.body.email
   
    let searchParams = [];
    if(sessionName !== name) {
        searchParams.push({ name });
    }
    if(sessionEmail !== email) {
        searchParams.push({ email });
    }
    if(sessionUsername !== username) {
        searchParams.push({ username });
    }
    
    if(searchParams.length > 0) { // 바꾸려는 값이 다른 사용자가 이미 사용하고 있는지 체크
        const foundUser = await User.findOne({ $or: searchParams });
        console.log(foundUser);
        if(foundUser && foundUser._id.toString() !== _id) { // 현재 값을 바꾸려는 사용자와 이미 해당 값을 가지고 있는 사용자의 동일성 비교
            return res.status(400).render("edit-profile", {
                pageTitle: "Edit-Profile",
                errorMessage: "This username/email is already taken.",
            });
        }
    }
    
    await User.findByIdAndUpdate(_id, { // mongodb 값 업데이트
        avatarUrl: file? file.path : avatarUrl,
        name,
        email,
        username,
        location,
    });
    req.session.user = { // 세션에서 값 업데이트
        ...req.session.user, // 나머지는 이전 session값과 동일
        name,
        email,
        username,
        location,
    };
    return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {

    if(req.session.user.socialOnly === true) {
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle: "Change Password"});
}

export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: {_id, password},
        },
        body: {oldPassword, newPassword, newPasswordConfirmation},
    } = req;
    const ok = await bcrypt.compare(oldPassword, password);
    if(!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password", 
            errorMessage: "The current password is incorrect",
        });
    }
    if(newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password", 
            errorMessage: "The password does not match the confirmation",
        });
    }
    const user = await User.findById(_id);
    user.password = newPassword;
    await user.save(); // pre save 작동 => 새로운 비밀번호 hash
    req.session.user.password = user.password;
    return res.redirect("/users/logout");

}
export const remove = (req, res) => res.send("Remove User");


export const see = async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id).populate("videos");
    console.log(user);
    if(!user) {
        return res.status(404).render("404", {pageTitle: "User not found" } );
    }
    return res.render("users/profile", {
        pageTitle: user.name,
        user, 
    });
}

