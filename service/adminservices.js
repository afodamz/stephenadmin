

export default class AdminServices {

    loginService = (req, res) => {
        // res.render("login", {
        //     name: "guest",
        // });
        res.render("login");
    }

    loginSubmitService = (req, res, next) => {
        passport.authenticate("local", {
            successRedirect: `/admin`,
            failureRedirect: "/login",
            failureFlash: true,
        })(req, res, next);
    }

    registerService = (req, res) => {
        res.render("register");
    }
    
    dashboardService = (req, res) => {
        res.render("dashboard");
    }
    
    getGrillsService = (req, res) => {
        res.render("grills/get");
    }
    
    getSingleGrillsService = (req, res) => {
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

    updateGrillsService = (req, res) => {
        console.log("params", req.params.id)
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
            email,
            password,
            password2,
            city,
            state,
            country,
            pincode,
            address,
        } = req.body;
        let errors = [];

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !password2 ||
            !city ||
            !state ||
            !country ||
            !pincode ||
            !address
        ) {
            errors.push({ msg: "Please enter all fields" });
        }

        if (password != password2) {
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
                email,
                password,
                password2,
                city,
                state,
                country,
                pincode,
                address,
                name: "guest",
            });
        } else {
            const Q = `SELECT * FROM users WHERE email = "${email}"`;
            DB.query(Q, (err, result) => {
                if (err) throw err;
                if (result[0]) {
                    errors.push({ msg: "Email already exists" });
                    res.render("register", {
                        errors,
                        firstName,
                        lastName,
                        email,
                        password,
                        password2,
                        city,
                        state,
                        country,
                        pincode,
                        address,
                        name: "guest",
                    });
                    return;
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err;
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) throw err;
                            password = hash;
                            const Query = "INSERT INTO users SET ?";
                            const Options = {
                                firstName,
                                lastName,
                                email,
                                password,
                                city,
                                state,
                                country,
                                pincode,
                                address,
                            };
                            DB.query(Query, Options, (err, result) => {
                                if (err) throw err;
                                if (result) {
                                    req.flash(
                                        "success_msg",
                                        "You are now registered. Please log in to continue."
                                    );
                                    res.redirect("/users/login");
                                }
                            });
                        });
                    });
                }
            });
        }
    }

    logoutService = (req, res) => {
        req.logout();
        req.flash("success_msg", "Yopu are logged put");
        req.redirect("/login")
    }

}