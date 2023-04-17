import { Router } from 'express';
import WishlistServices from '../service/wishlistservice.js'
import DB from '../db/connection.js';
import { authenticateUser } from '../config/auth.js';

const WishlistRoutes = Router();
const wishlistServices = new WishlistServices(DB);

WishlistRoutes.post('/add', authenticateUser, wishlistServices.addProductToWishlist);
WishlistRoutes.get('/', authenticateUser, wishlistServices.getProductsInWishlst);
WishlistRoutes.get('/public', wishlistServices.getWishlst);
WishlistRoutes.delete('/empty', authenticateUser, wishlistServices.emptyWishlist);
WishlistRoutes.delete('/removeProduct/:productId', authenticateUser, wishlistServices.removeProduct);


export default WishlistRoutes;
