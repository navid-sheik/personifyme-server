import express from 'express';
import {getUserById, updateUserById } from '../controllers/user-controller.js';
import { auth } from '../middleware/auth.js';


const router  = express.Router();




 
router.get('/',  auth, getUserById);
router.put('/', auth,updateUserById);





export default router;

