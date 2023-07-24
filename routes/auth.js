import express from 'express';
import { signup } from '../controllers/auth-controller.js';


const router  = express.Router();


const temp = (req, res) => {};

 
router.post('/signup', signup);
router.post('/login', temp);
router.post('/logout', temp);
router.post('access-token', temp);
router.post('/refresh', temp);
router.post('/forgot-password', temp);
router.post('/reset-password', temp);




export default router;