import express from 'express';
import StripeController from '../controllers/stripe-webhook-controller.js';

const router = express.Router();

router.post('/', express.raw({type: 'application/json'}), StripeController.webhook);

export default router;