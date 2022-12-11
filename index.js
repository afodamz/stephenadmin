import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
// import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import AdminRoutes from "./router/admin.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);
// Passport middleware
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
  });

// app.use('/', (req, res) => {
//     res.redirect("/admin/login");
// });
app.use("/admin", AdminRoutes);
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