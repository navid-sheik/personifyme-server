import express from 'express';
import {  approveItem, disapproveItem, getAllUnverifiedProducts } from '../controllers/moderator-controller.js';
import { auth, moderatorAuth } from '../middleware/auth.js';


const router  = express.Router();



// Route to approve an item; assuming that the item's ID is sent in the URL as a parameter
router.post('/approve/:id',auth ,  moderatorAuth,  approveItem);

// Route to disapprove an item; assuming that the item's ID is sent in the URL as a parameter
router.post('/disapprove/:id',auth,  moderatorAuth,disapproveItem);

router.get('/products', auth, moderatorAuth, getAllUnverifiedProducts);

export default router;

