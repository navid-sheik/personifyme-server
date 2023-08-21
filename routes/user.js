import express from 'express';
import {getSavedPaymentMethodsByUserId, getUserById, updateUserById } from '../controllers/user-controller.js';
import { auth } from '../middleware/auth.js';


const router  = express.Router();




 
router.get('/',  auth, getUserById);
router.put('/', auth,updateUserById);
router.get('/payment-methods', auth, getSavedPaymentMethodsByUserId);





export default router;

