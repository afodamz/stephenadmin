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
import AdminServices from '../service/adminservices.js'
import DB from '../db/connection.js';


const AdminRoutes = express.Router();
const adminServices = new AdminServices(DB);

AdminRoutes.get("/login", forwardAuthenticated, adminServices.loginService)
AdminRoutes.post("/login", forwardAuthenticated, adminServices.loginSubmitService)
AdminRoutes.get("/forgot-password", forwardAuthenticated, adminServices.forgotPasswordService)
AdminRoutes.post("/forgot-password", forwardAuthenticated, adminServices.forgotPasswordSubmitService)
AdminRoutes.get("/register", forwardAuthenticated, adminServices.registerService)
AdminRoutes.post("/register", forwardAuthenticated, adminServices.registerSubmitService)
// AdminRoutes.get("/dashboard", ensureAuthenticated, adminServices.dashboardService)
AdminRoutes.get("/get-grills", ensureAuthenticated, adminServices.getGrillsService)
AdminRoutes.get("/get-grill/:id", ensureAuthenticated, adminServices.getSingleGrillsService)
AdminRoutes.get("/update-grill/:id", ensureAuthenticated, adminServices.updateGrillsService)
AdminRoutes.get("/delete-grill/:id", ensureAuthenticated, adminServices.deleteGrillsService)
AdminRoutes.get("/create-grills", ensureAuthenticated, adminServices.createGrillsService)
AdminRoutes.post("/create-grills", ensureAuthenticated, adminServices.createGrillsSubmitService)
AdminRoutes.get("/categories", ensureAuthenticated, adminServices.getCategoriesService)
// AdminRoutes.get("/get-grill/:id", forwardAuthenticated, adminServices.getSingleGrillsService)
// AdminRoutes.get("/update-grill/:id", forwardAuthenticated, adminServices.updateGrillsService)
// AdminRoutes.get("/delete-grill/:id", forwardAuthenticated, adminServices.deleteGrillsService)
// AdminRoutes.get("/create-grills", forwardAuthenticated, adminServices.createGrillsService)
AdminRoutes.get("/dashboard", ensureAuthenticated, adminServices.dashboardService)
AdminRoutes.get("/logout", adminServices.logoutService)

export default AdminRoutes;