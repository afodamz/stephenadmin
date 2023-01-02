import express from "express";
import PublicServices from '../service/publicservice.js'
import DB from '../db/connection.js';


const PublicUrls = express.Router();
const productServices = new PublicServices(DB);

PublicUrls.get("/products", productServices.getProductService)

export default PublicUrls;