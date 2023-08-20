import express from 'express';
import * as PaymentController from '../controllers/payment-controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/balance', auth,  PaymentController.getBalance);
router.get('/history',auth,  PaymentController.getPaymentHistory);
router.get('/payouts', auth, PaymentController.getScheduledPayouts);

// ... other routes

export default router;
