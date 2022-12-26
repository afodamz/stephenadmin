import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
// import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import AuthRoutes from "./router/auth.js";
import AdminPages from "./router/pages.js";
import ProductRoutes from "./router/product.js";
import CategoryRoutes from "./router/category.js";
import passport from "passport";
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'

// require("./config/passport")(passport);
import passportConfig from "./config/passport.js";

passportConfig(passport);
dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use(
    fileUpload({
        limits: {
            fileSize: 10000000, // Around 10MB
        },
        abortOnLimit: true,
    })
);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app.use(expressLayouts);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#",
        resave: true,
        saveUninitialized: true,
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport middleware
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json


// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
  });

app.use("/auth", AuthRoutes);
app.use("/category", CategoryRoutes);
app.use("/product", ProductRoutes);
app.use("/admin", AdminPages);
app.get("*", (req, res) => {
    // console.log("here done")
    // res.redirect("/");
    res.render("404");
  });

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Serve at http://localhost:${port}`);
});