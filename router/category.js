import { ensureAuthenticated, forwardAuthenticated } from '../config/auth.js';
import express from "express";
import DB from '../db/connection.js';
import CategoryServices from '../service/categoryservice.js';


const CategoryRoutes = express.Router();
const categoryServices = new CategoryServices(DB);

CategoryRoutes.post("/create", ensureAuthenticated, categoryServices.createCategoryService)


export default CategoryRoutes;