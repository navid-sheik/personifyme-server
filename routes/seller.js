import express from 'express';
import { auth } from '../middleware/auth.js';
import { deleteSellerProduct, getSellerAccount, getSellerProducts, getSellerStripeStatus, requestNewOnboardingLink, updateSellerProduct } from '../controllers/seller.js';

const router  = express.Router();


router.get('/account' , getSellerAccount);

router.get('/products',  getSellerProducts);
router.put('/products/:id',  updateSellerProduct );
router.put('/products/delete/:id',  deleteSellerProduct );


// Stripe-related routes
router.get('/stripe/status', auth, getSellerStripeStatus); // Replace with actual middleware if necessary
router.get('/stripe/request-new-link', auth, requestNewOnboardingLink); // Replace with actual middleware if necessary

export default router;