import { Router } from 'express';
import CartServices from '../service/cartservice.js'
import DB from '../db/connection.js';
import { authenticateUser } from '../config/auth.js';

const CartRoutes = Router();
const cartServices = new CartServices(DB);

CartRoutes.post('/add', authenticateUser, cartServices.addProductToCart);
CartRoutes.post('/createorder', authenticateUser, cartServices.createOrder);
CartRoutes.post('/myordes', authenticateUser, cartServices.getmyOrders);
CartRoutes.post('/orders', authenticateUser, cartServices.getOrders);
CartRoutes.get('/:cart_id', authenticateUser, cartServices.getProductsInCart);
CartRoutes.delete('/empty/:cart_id', authenticateUser, cartServices.emptyCart);
CartRoutes.delete('/removeProduct/:item_id', authenticateUser, cartServices.removeProduct);


export default CartRoutes;
