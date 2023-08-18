import express from 'express';
import authRouter from './auth.js';
import onBoardingRouter from './on-boarding.js';
import sellerRouter from './seller.js'

import productRouter from './product.js'
import reviewRouter from './review.js'
import categoryRouter from './category.js'
import orderRouter from './order.js'
import cartRouter from './cart.js'
import buyerRouter from './buyer.js'
import searchRouter from './searches.js'
import shopRouter from './shop.js'
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
router.use('/orders',orderRouter )
router.use('/shop',shopRouter )
router.use('/user',auth, buyerRouter )
router.use('/search', searchRouter)


export default router;