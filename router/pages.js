import { ensureAuthenticated, forwardAuthenticated } from '../config/auth.js';
import express from "express";
import AdminServices from '../service/adminservices.js'
import DB from '../db/connection.js';


const AdminPages = express.Router();
const adminServices = new AdminServices(DB);

AdminPages.get("/login", forwardAuthenticated, adminServices.loginService)
AdminPages.get("/forgot-password", forwardAuthenticated, adminServices.forgotPasswordService)
AdminPages.get("/register", forwardAuthenticated, adminServices.registerService)
AdminPages.get("/get-grills", ensureAuthenticated, adminServices.getGrillsService)
AdminPages.get("/view-orders", ensureAuthenticated, adminServices.getOrdersService)
AdminPages.get("/get-grill/:id", ensureAuthenticated, adminServices.getSingleGrillsService)
AdminPages.get("/update-grill/:id", ensureAuthenticated, adminServices.updateGrillsService)
AdminPages.get("/delete-grill/:id", ensureAuthenticated, adminServices.deleteGrillsService)
AdminPages.get("/create-grills", ensureAuthenticated, adminServices.createGrillsService)
AdminPages.get("/categories", ensureAuthenticated, adminServices.getCategoriesService)
AdminPages.get("/dashboard", ensureAuthenticated, adminServices.dashboardService)
AdminPages.get("/logout", adminServices.logoutService)

export default AdminPages;