import express from 'express';
import { createShop, getShopBySeller, updateShop, deactivateShop, activateShop , getShopById, getShopProduct, followShop, unfollowShop, getShopNumberItemSold, checkShopPriviligies} from '../controllers/shop-controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if the request is authenticated

// Route to create a new shop
router.post('/', auth, createShop);

// Route to get the shop details of a seller
router.get('/', auth, getShopBySeller);

// Route to update shop details by a seller
router.put('/', auth, updateShop);

// Route to deactivate a shop by a seller
router.put('/deactivate',auth,  deactivateShop);
router.put('/activate',auth,  activateShop);

router.get('/:id', getShopById);
router.post('/products', getShopProduct);
router.post('/follow/:id', auth, followShop);

router.post('/unfollow/:id', auth, unfollowShop);


//Get orders count
router.get('/orders/count/:id' , getShopNumberItemSold)
//Get likes

router.get('/check/:id', auth, checkShopPriviligies);

export default router;