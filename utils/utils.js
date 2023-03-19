import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
    try {
        const payload = { sub: user.id, id: user.id, userType: user.userType };
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: "2d" }
        );
        const refreshToken = jwt.sign(
            { sub: user.id },
            process.env.REFRESH_TOKEN_PRIVATE_KEY,
            { expiresIn: "30d" }
        );

        // const userToken = await UserToken.findOne({ userId: user._id });
        // if (userToken) await userToken.remove();

        // await new UserToken({ userId: user._id, token: refreshToken }).save();
        // return Promise.resolve({ accessToken, refreshToken });
        return { accessToken, refreshToken };
    } catch (err) {
        return Promise.reject(err);
    }
};

export const verifyRefreshToken = (refreshToken) => {
    const privateKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;

    // return new Promise((resolve, reject) => {
    //     UserToken.findOne({ token: refreshToken }, (err, doc) => {
    //         if (!doc)
    //             return reject({ error: true, message: "Invalid refresh token" });

    //         jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
    //             if (err)
    //                 return reject({ error: true, message: "Invalid refresh token" });
    //             resolve({
    //                 tokenDetails,
    //                 error: false,
    //                 message: "Valid refresh token",
    //             });
    //         });
    //     });
    // });

    jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
        if (err)
            return err;
        return tokenDetails
    });
};

export const isTokenValid = (token) => jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);