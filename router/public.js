import express from "express";
import PublicServices from '../service/publicservice.js';
import Orderervices from '../service/orderservice.js';
import DB from '../db/connection.js';


const PublicUrls = express.Router();
const productServices = new PublicServices(DB);
const orderServices = new Orderervices(DB);

PublicUrls.get("/products", productServices.getProductService)
PublicUrls.post("/createorder", orderServices.createOrderSubmitService)

export default PublicUrls;