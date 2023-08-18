import express from 'express';
import { auth } from '../middleware/auth.js';
import { deleteSellerProduct, getSellerAccount, getSellerProducts, updateSellerProduct } from '../controllers/seller.js';

const router  = express.Router();


router.get('/account' , getSellerAccount);

router.get('/products',  getSellerProducts);
router.put('/products/:id',  updateSellerProduct );
router.put('/products/delete/:id',  deleteSellerProduct );
export default router;