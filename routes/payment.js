import express from 'express';
import { auth } from '../middleware/auth.js';
import { createCustomer, checkAccount, updateOnBoarding, checkVerifedStatus } from '../controllers/auth-controller.js';
import { checkVerificationStripe, createConnectAccount, refreshOnBoardingLink, requestOnBoardingLink, updateOnBoardingLink } from '../controllers/payment.js';

const router  = express.Router();


router.post('/account' ,  createConnectAccount);
router.post('/link',  requestOnBoardingLink)
router.post('/update',  updateOnBoardingLink)
router.get('/refresh/:account_id',  refreshOnBoardingLink)
router.post('/status',  checkVerificationStripe)
export default router;