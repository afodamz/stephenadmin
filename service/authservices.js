import passport from 'passport';
import bcrypt from "bcrypt";
import { generateTokens, verifyRefreshToken } from "../utils/utils.js";
import { v4 as uuidv4 } from 'uuid';

export default class AdminServices {

    constructor(DB) {
        this.DB = DB;
    }

    loginSubmitService = (req, res, next) => {
        console.log("body", req.body)
        passport.authenticate("local", {
            successRedirect: `/admin/dashboard`,
            failureRedirect: "/admin/login",
            failureFlash: true,
        })(req, res, next);
    }

    loginUserSubmitService = (req, res, next) => {
        const { email, password } = req.body;
        try {
            let errors = [];

            if (!password) {
                errors.push({ msg: "Password cannot be empty" });
            }

            if (!email) {
                errors.push({ msg: "Email cannot be empty" });
            }

            const Q = `SELECT * FROM user WHERE email = "${email}"`;
            this.DB.query(Q, (err, result) => {
                if (err) throw err;
                let foundUser = result[0];
                console.log("foundUser", foundUser)
                if (foundUser) {
                    bcrypt.compare(password, foundUser.password, (err, data) => {
                        //if error than throw error
                        if (err) throw err
                        if (data) {
                            const { accessToken, refreshToken } = generateTokens(foundUser);
                            return res.status(200).json({
                                error: false,
                                accessToken,
                                refreshToken,
                                msg: "Login success"
                            })
                        } else {
                            return res.status(401).json({ msg: "Invalid credencials" })
                        }

                    })
                } else {
                    return res.status(401).json({ msg: "Invalid credencials" })
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    forgotPasswordSubmitService = (req, res) => {
        console.log("params", req.params.id)
        const id = req.params.id;
        var name;
        if (req.user) {
            name = req.user.firstName;
        } else {
            name = "guest";
        }
        res.render("grills/details");
    }

    forgotUserPasswordSubmitService = (req, res) => {
        console.log("params", req.params.id)
        const id = req.params.id;
        var name;
        if (req.user) {
            name = req.user.firstName;
        } else {
            name = "guest";
        }
        res.render("grills/details");
    }

    refreshtokenService = (req, res) => {
        var {
            refreshToken,
        } = req.body;
        if (!refreshToken) {
            errors.push({ msg: "refreshToken cannot be empty" });
        }
        verifyRefreshToken(refreshToken)
            .then(({ tokenDetails }) => {
                const payload = { sub: tokenDetails.id, id: tokenDetails.id, userType: tokenDetails.userType };
                const accessToken = jwt.sign(
                    payload,
                    process.env.ACCESS_TOKEN_PRIVATE_KEY,
                    { expiresIn: "14m" }
                );
                res.status(200).json({
                    error: false,
                    accessToken,
                    message: "Access token created successfully",
                });
            })
            .catch((err) => res.status(400).json(err));
    }

    registerSubmitService = (req, res) => {
        var {
            firstName,
            lastName,
            userName,
            email,
            password,
            password1
        } = req.body;
        let errors = [];

        if (
            !firstName ||
            !lastName ||
            !userName ||
            !email ||
            !password ||
            !password1
        ) {
            errors.push({ msg: "Please enter all fields" });
        }

        if (password != password1) {
            errors.push({ msg: "Passwords do not match" });
        }

        if (password.length < 6) {
            errors.push({ msg: "Password must be at least 6 characters" });
        }

        if (errors.length > 0) {
            res.render("register", {
                errors,
                firstName,
                lastName,
                userName,
                email,
                password,
                password1,
                name: "guest",
            });
        } else {
            const Q = `SELECT * FROM user WHERE email = "${email}"`;
            this.DB.query(Q, (err, result) => {
                if (err) throw err;
                if (result[0]) {
                    errors.push({ msg: "Email already exists" });
                    res.render("register", {
                        errors,
                        firstName,
                        lastName,
                        userName,
                        email,
                        password,
                        password1,
                        userType: "ADMIN",
                    });
                    return;
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err;
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) throw err;
                            password = hash;
                            const Query = "INSERT INTO user SET ?";
                            const Options = {
                                id: uuidv4(),
                                first_name: firstName,
                                last_name: lastName,
                                username: userName,
                                email,
                                password,
                                dateCreated: new Date()
                                // dateCreated: moment().format("MM ddd, YYYY HH:mm:ss a")
                            };
                            this.DB.query(Query, Options, (err, result) => {
                                if (err) throw err;
                                if (result) {
                                    req.flash(
                                        "success_msg",
                                        "You are now registered. Please log in to continue."
                                    );
                                    res.redirect("/admin/login");
                                }
                            });
                        });
                    });
                }
            });
        }
    }

    registerUserSubmitService = (req, res) => {
        var {
            firstName,
            lastName,
            userName,
            email,
            password,
            password1
        } = req.body;
        let errors = [];

        if (
            !firstName ||
            !lastName ||
            !userName ||
            !email ||
            !password ||
            !password1
        ) {
            errors.push({ msg: "Please enter all fields" });
        }

        if (password != password1) {
            errors.push({ msg: "Passwords do not match" });
        }

        if (password.length < 6) {
            errors.push({ msg: "Password must be at least 6 characters" });
        }

        if (errors.length > 0) {
            return res.status(401).json({ msg: "Invalid credencials", errors })
        } else {
            const Q = `SELECT * FROM user WHERE email = "${email.toLowerCase()}"`;
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(401).json({ msg: "Internal server error", err });
                if (result[0]) {
                    return res.status(401).json({ msg: "User with email already exists", errors })
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) return res.status(401).json({ msg: "Invalid credencials", err });
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) return res.status(401).json({ msg: "Invalid credencials", err });
                            password = hash;
                            const Query = "INSERT INTO user SET ?";
                            const Options = {
                                id: uuidv4(),
                                first_name: firstName,
                                last_name: lastName,
                                username: userName.toLowerCase(),
                                email: email.toLowerC8ase(),
                                password,
                                userType: "USER",
                                dateCreated: new Date()
                                // dateCreated: moment().format("MM ddd, YYYY HH:mm:ss a")
                            };
                            this.DB.query(Query, Options, (err, result) => {
                                if (err) return res.status(401).json({ msg: "Invalid credencials error creating user", err });
                                if (result) {
                                    return res.status(201).json({ msg: "User successfully created" })
                                }
                            });
                        });
                    });
                }
            });
        }
    }

}