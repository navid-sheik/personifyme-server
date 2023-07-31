import express from 'express';
import authRouter from './auth.js';
import onBoardingRouter from './on-boarding.js';
import sellerRouter from './seller.js'
import webHookRouter from './stripe-webhook.js'
import { auth } from '../middleware/auth.js';

const router  = express.Router();



router.use('/', authRouter);
router.use('/webhook', webHookRouter);

router.use('/onboarding', auth,  onBoardingRouter);
router.use('/seller', auth,  sellerRouter);



export default router;