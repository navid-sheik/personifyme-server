import express from 'express';
import authRouter from './auth.js';
import onBoardingRouter from './on-boarding.js';
import sellerRouter from './seller.js'

import productRouter from './product.js'
import reviewRouter from './review.js'
import categoryRouter from './category.js'
import cartRouter from './cart.js'
import webHookRouter from './stripe-webhook.js'
import { auth } from '../middleware/auth.js';

const router  = express.Router();



router.use('/', authRouter);
router.use('/webhook', webHookRouter);
router.use('/cart', auth,  cartRouter);
router.use('/onboarding', auth,  onBoardingRouter);
router.use('/products',  productRouter);
router.use('/categories',  categoryRouter);
router.use('/seller', auth,  sellerRouter);
router.use('/reviews',reviewRouter )



export default router;