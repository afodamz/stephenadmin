import passport from 'passport';
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'

export default class AdminServices {

    constructor(DB) {
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
        const Query = `SELECT products.*, JSON_ARRAYAGG(JSON_OBJECT('id', category.id, 'name', category.name)) as categories FROM products 
        inner JOIN product_categories ON product_categories.productId=products.id
        inner JOIN category ON category.id= product_categories.categoriesId 
        where products.is_deleted=false AND category.is_deleted=false GROUP BY products.id ORDER BY products.dateCreated DESC
        LIMIT 5`;
        this.DB.query(Query, (err, allProdcts) => {
            if (err) throw err;
            res.render("dashboard", {
                allProdcts,
                moment
            });
        });
    }

    getCategoriesService = (req, res, DB) => {
        const { name } = req.query;
        const Query = `SELECT * FROM category WHERE is_deleted is false order by dateCreated DESC`;
        // const categoriesQuery = `SELECT * FROM category WHERE name = ${name} and is_deleted is false`;
        this.DB.query(Query, (err, allCategories) => {
            if (err) throw err;
            res.render("categories/get", {
                allCategories,
                moment
            });
        });
    }

    getGrillsService = (req, res) => {
        const Query = `SELECT products.*, JSON_ARRAYAGG(JSON_OBJECT('id', category.id, 'name', category.name)) as categories FROM products 
inner JOIN product_categories ON product_categories.productId=products.id
inner JOIN category ON category.id= product_categories.categoriesId 
where products.is_deleted=false AND category.is_deleted=false GROUP BY products.id ORDER BY products.dateCreated DESC
`;
        this.DB.query(Query, (err, allProdcts) => {
            if (err) throw err;
            console.log("allProdcts", allProdcts)
            res.render("grills/get", {
                allProdcts,
                moment
            });
        });
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

    updateGrillsService = (req, res) => {
        const id = req.params.id;
        const Query = `SELECT products.*, JSON_ARRAYAGG(JSON_OBJECT('id', category.id, 'name', category.name)) as categories FROM products 
        inner JOIN product_categories ON product_categories.productId=products.id
        inner JOIN category ON category.id= product_categories.categoriesId 
        where products.is_deleted=false AND category.is_deleted=false AND products.id='${id}' GROUP BY products.id`;
        this.DB.query(Query, (err, product) => {
            if (err) throw err;
            if (product.length > 0) {
                const Query = `SELECT * FROM category WHERE is_deleted is false`;
                this.DB.query(Query, (err, allCategories) => {
                    if (err) throw err;
                    res.render("grills/update", {
                        product: product[0],
                        allCategories,
                        moment
                    });
                });

            } else {
                res.redirect('/404')
            }
        });
    }

    getSingleGrillsService = (req, res) => {
        const id = req.params.id;
        const Query = `SELECT products.*, JSON_ARRAYAGG(JSON_OBJECT('id', category.id, 'name', category.name)) as categories FROM products 
inner JOIN product_categories ON product_categories.productId=products.id
inner JOIN category ON category.id= product_categories.categoriesId 
where products.is_deleted=false AND category.is_deleted=false AND products.id='${id}' GROUP BY products.id`;
        this.DB.query(Query, (err, product) => {
            if (err) throw err;
            product = product[0]
            var images = product['images']
            product['images'] = JSON.parse(images)
            res.render("grills/details", {
                product,
                moment
            });
        });
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
        const Query = `SELECT * FROM category WHERE is_deleted is false`;
        this.DB.query(Query, (err, allCategories) => {
            if (err) throw err;
            res.render("grills/create", {
                allCategories,
                moment
            });
        });
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

    logoutService = (req, res) => {
        req.session.destroy(function (err) {
            // req.flash("success_msg", "You are logged out");
            res.redirect('/admin/login'); //Inside a callback… bulletproof!
        });
    }

}