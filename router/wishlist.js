import { Router } from 'express';
import WishlistServices from '../service/wishlistservice.js'
import DB from '../db/connection.js';
import { authenticateUser } from '../config/auth.js';

const WishlistRoutes = Router();
const wishlistServices = new WishlistServices(DB);

WishlistRoutes.post('/add', authenticateUser, wishlistServices.addProductToWishlist);
WishlistRoutes.get('/', authenticateUser, wishlistServices.getProductsInWishlst);
WishlistRoutes.delete('/empty/:cart_id', authenticateUser, wishlistServices.emptyWishlist);
WishlistRoutes.delete('/removeProduct/:item_id', authenticateUser, wishlistServices.removeProduct);


export default WishlistRoutes;
