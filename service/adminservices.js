import passport from 'passport';
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'

export default class AdminServices {

    constructor(DB){
        this.DB = DB;
    }

    loginService = (req, res) => {
        // res.render("login", {
        //     name: "guest",
        // });
        res.render("login");
    }

    loginSubmitService = (req, res, next) => {
        console.log("body", req.body)
        passport.authenticate("local", {
            successRedirect: `/admin/dashboard`,
            failureRedirect: "/admin/login",
            failureFlash: true,
        })(req, res, next);
    }

    registerService = (req, res) => {
        res.render("register");
    }
    
    dashboardService = (req, res) => {
        res.render("dashboard");
    }
    
    getCategoriesService = (req, res, DB) => {
        const { name } = req.query;
    const categoriesQuery = `SELECT * FROM category WHERE is_deleted is false`;
    // const categoriesQuery = `SELECT * FROM category WHERE name = ${name} and is_deleted is false`;
    this.DB.query(categoriesQuery, (err, allCategories) => {
      if (err) throw err;
      res.render("categories/get", {
        allCategories,
      });
    });
    }
    
    getGrillsService = (req, res) => {
        res.render("grills/get");
    }
    
    forgotPasswordService = (req, res) => {
        res.render("forgot-password");
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
    
    getSingleGrillsService = (req, res) => {
        const id = req.params.id;
        var name;
        if (req.user) {
            name = req.user.firstName;
          } else {
            name = "guest";
          }
        res.render("grills/details");
    }

    updateGrillsService = (req, res) => {
        const id = req.params.id;
        var name;
        if (req.user) {
            name = req.user.firstName;
          } else {
            name = "guest";
          }
        res.render("grills/update");
    }

    updateSubmitGrillsService = (req, res) => {
        const id = req.params.id;
        var name;
        if (req.user) {
            name = req.user.firstName;
          } else {
            name = "guest";
          }
        res.render("grills/details");
    }

    deleteGrillsService = (req, res) => {
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
    
    createGrillsService = (req, res) => {
        console.log("grills create")
        res.render("grills/create");
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

        console.log("errors", errors)
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
                                first_name:firstName,
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

    logoutService = (req, res) => {
        req.session.destroy(function (err) {
            // req.flash("success_msg", "You are logged out");
            res.redirect('/admin/login'); //Inside a callback… bulletproof!
          });
    }

}