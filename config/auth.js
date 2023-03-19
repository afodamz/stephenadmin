import { isTokenValid } from '../utils/utils.js';

export const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash("error_msg", "Please login to continue");
        res.redirect("/admin/login");
    }
}

export const forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/admin/dashboard");
    }
}

export const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ msg: "UnAthorized to perform action" })
    }
    const token = authHeader.split(' ')[1];

    try {
        const payload = isTokenValid(token);
        // attach the user to the job routes
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ msg: "UnAthorized to perform action" })
    }
};
// export const authenticateUser = async (req, res, next) => {
//     const { refreshToken, accessToken } = req.signedCookies;

//     try {
//       if (accessToken) {
//         const payload = isTokenValid(accessToken);
//         req.user = payload.user;
//         return next();
//       }
//       const payload = isTokenValid(refreshToken);

//       req.user = payload.user;
//       next();
//     } catch (error) {
//       return res.status(401).json({ msg: "Aunthorized to perform action" })
//     }
//   };

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({ msg: "Aunthorized to perform action" })
        }
        next();
    };
};