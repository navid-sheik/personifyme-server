import express from 'express';
import { likeProduct, getLikedProducts, unlikeProduct } from '../controllers/buyer-controller.js';
import { auth } from '../middleware/auth.js';


const router  = express.Router();




router.get('/likes', getLikedProducts);
router.put('/like/:id', likeProduct);
router.put('/unlike/:id', unlikeProduct);




export default router;

