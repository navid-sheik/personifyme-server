import express from 'express';
import { checkVerifedStatus, login, logout, protectedRoute, requestVerificationCode, resetPassword, sendPasswordResetLink, signup, token, verifyAccount, verifyPasswordResetLink } from '../controllers/auth-controller.js';
import { auth } from '../middleware/auth.js';


const router  = express.Router();




 
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', auth,  logout);
router.post('/token',   token);
router.post('/protected', auth , protectedRoute);
router.post('/sendVerifyLink', requestVerificationCode);
router.get('/checkVerifiedStatus', auth, checkVerifedStatus);
router.post('/verify', verifyAccount);
router.post('/sendPasswordLink', sendPasswordResetLink);
router.post('/resetPassword/:id/:token', resetPassword);
router.get('/verifyPasswordLink/:id/:token', verifyPasswordResetLink);





export default router;

