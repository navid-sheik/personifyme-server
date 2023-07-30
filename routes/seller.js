import express from 'express';
import { auth } from '../middleware/auth.js';
import { getSellerAccount } from '../controllers/seller.js';

const router  = express.Router();


router.get('/account' , getSellerAccount);

export default router;