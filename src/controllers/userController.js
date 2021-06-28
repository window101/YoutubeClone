
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
        scope: "read:user user:email",
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
    }
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
        const existingUser = await User.findOne({ email: emailObj.email });
        if(existingUser) {
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/");
        }else { // 없다면 계정 생성
            const user = await User.create({
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
        }
    }else {
        return res.redirect("/login");
    }
}

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");


export const see = (req, res) => res.send("See User");

