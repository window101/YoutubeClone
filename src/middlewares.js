
// locals => pug 템플릿과 express 간의 공유 가능 (다른 세션 객체는 불가능)

export const localsMiddleware = (req, res, next) => {
    
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName= "Wetube",
    res.locals.loggedInUser = req.session.user;
    console.log(res.locals);
    next();
}