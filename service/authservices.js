import passport from 'passport';
import bcrypt from "bcrypt";
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
                        name: "guest",
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

}