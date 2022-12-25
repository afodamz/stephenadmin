import { forwardAuthenticated } from '../config/auth.js';
import express from "express";
import AuthServices from '../service/authservices.js'
import DB from '../db/connection.js';

const AuthRoutes = express.Router();
const authServices = new AuthServices(DB);

AuthRoutes.post("/login", forwardAuthenticated, authServices.loginSubmitService)
AuthRoutes.post("/forgot-password", forwardAuthenticated, authServices.forgotPasswordSubmitService)
AuthRoutes.post("/register", forwardAuthenticated, authServices.registerSubmitService)

export default AuthRoutes;