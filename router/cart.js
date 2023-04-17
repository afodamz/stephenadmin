import { Router } from 'express';
import CartServices from '../service/cartservice.js'
import DB from '../db/connection.js';
import { authenticateUser } from '../config/auth.js';

const CartRoutes = Router();
const cartServices = new CartServices(DB);

CartRoutes.post('/add', authenticateUser, cartServices.addProductToCart);
CartRoutes.post('/createorder', authenticateUser, cartServices.createOrder);
CartRoutes.get('/', authenticateUser, cartServices.getProductsInCart);
CartRoutes.get('/orders', authenticateUser, cartServices.getmyOrders);
// CartRoutes.get('/:cart_id', authenticateUser, cartServices.getProductsInCart);
CartRoutes.delete('/empty', authenticateUser, cartServices.emptyCart);
CartRoutes.delete('/removeProduct/:productId', authenticateUser, cartServices.removeProduct);


export default CartRoutes;
