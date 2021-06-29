
// locals => pug 템플릿과 express 간의 공유 가능 (다른 세션 객체는 불가능)
import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName= "Wetube",
    res.locals.loggedInUser = req.session.user || {};
    //console.log(res.locals);
    next();
}

export const protectorMiddleware = (req, res, next) => { // 사용자가 로그인 돼 있지 않으면, 로그인 페이지로 redirect
    if(req.session.loggedIn) {
        next();
    }else {
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => { // protectorMiddleware와 반대의 기능
    if(!req.session.loggedIn) {                             // 즉, 로그아웃 돼 있어야 next()
        return next();
    }else {
        return res.redirect("/");
    }
}

export const uploadFiles = multer({ dest: "uploads/" });