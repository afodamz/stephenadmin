export const ensureAuthenticated = (req, res,next) => {
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error_msg", "Please login to continue");
        req.redirect("/admin/login");
    }
}

export const forwardAuthenticated = (req, res,next) =>{
    if(!req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/admin/login");
    }
}