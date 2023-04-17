import { forwardAuthenticated, authenticateUser } from '../config/auth.js';
import express from "express";
import AuthServices from '../service/authservices.js'
import DB from '../db/connection.js';

const AuthRoutes = express.Router();
const authServices = new AuthServices(DB);

AuthRoutes.post("/login", forwardAuthenticated, authServices.loginSubmitService)
AuthRoutes.post("/user/login",  authServices.loginUserSubmitService)
AuthRoutes.post("/forgot-password", forwardAuthenticated, authServices.forgotPasswordSubmitService)
AuthRoutes.post("/user/forgot-password", authServices.forgotUserPasswordSubmitService)
AuthRoutes.post("/register", forwardAuthenticated, authServices.registerSubmitService)
AuthRoutes.post("/user/register", authServices.registerUserSubmitService)
AuthRoutes.get("/user/profile", authenticateUser, authServices.userProfileService)
AuthRoutes.post("/refreshtoken", authServices.refreshtokenService)

export default AuthRoutes;