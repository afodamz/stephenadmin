import mysql from 'mysql2';
import mysqlPromise from "mysql2/promise.js";
import {
    MYSQL_USERNAME,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PORT,
    PUBLIC_KEY,
    SECRET_KEY,
} from '../config/keys.js';
import { ensureAuthenticated, forwardAuthenticated } from '../config/auth.js';
import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import AdminServices from '../service/adminservices.js'

const AdminRoutes = express.Router();
const adminServices = new AdminServices();


// const DB = mysql.createConnection({
//     host: MYSQL_HOST,
//     user: MYSQL_USERNAME,
//     password: MYSQL_PASSWORD,
//     database: MYSQL_DATABASE,
//     port: MYSQL_PORT,
//     waitForConnections: true,
//     connectionLimit: 100,
//     queueLimit: 0
// });

const DB = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rooting",
    database: "stephenfeeds",
    port: "3306",
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
});

DB.connect((err) => {
    if (err) {
        console.log("DB error: ", err)
    } else {
        console.log("Mysql database connected successfully");
    }
});

AdminRoutes.get("/login", forwardAuthenticated, adminServices.loginService)
AdminRoutes.post("/login", forwardAuthenticated, adminServices.loginSubmitService)
AdminRoutes.get("/register", forwardAuthenticated, adminServices.registerService)
AdminRoutes.post("/register", forwardAuthenticated, adminServices.registerSubmitService)
// AdminRoutes.get("/dashboard", ensureAuthenticated, adminServices.dashboardService)
AdminRoutes.get("/get-grills", forwardAuthenticated, adminServices.getGrillsService)
AdminRoutes.get("/create-grills", forwardAuthenticated, adminServices.createGrillsService)
AdminRoutes.get("/dashboard", forwardAuthenticated, adminServices.dashboardService)
AdminRoutes.get("/logout", adminServices.logoutService)

export default AdminRoutes;