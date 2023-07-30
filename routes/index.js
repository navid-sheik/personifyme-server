import express from 'express';
import authRouter from './auth.js';
import paymentsRouter from './payment.js';
import sellerRouter from './seller.js'
import { auth } from '../middleware/auth.js';

const router  = express.Router();



router.use('/', authRouter);

router.use('/onboarding', auth,  paymentsRouter);
router.use('/seller', auth,  sellerRouter);



export default router;