import { ensureAuthenticated, forwardAuthenticated } from '../config/auth.js';
import express from "express";
import AdminServices from '../service/productservice.js'
import DB from '../db/connection.js';


const ProductRoutes = express.Router();
const productServices = new AdminServices(DB);

ProductRoutes.post("/create-grills", ensureAuthenticated, productServices.createGrillsSubmitService)
ProductRoutes.post("/update-grill/:id", ensureAuthenticated, productServices.updateGrillsSubmitService)


export default ProductRoutes;