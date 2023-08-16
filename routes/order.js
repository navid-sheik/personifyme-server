import express from 'express';
import { 
    createOrder, 
    getOrderById, 
    getUserOrders, 
    updateOrder, 
    deleteOrder,
    successOrder,
    getOrderItemsForUser,
    getOrderItemsForSeller, 

} from '../controllers/order-controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create a new order for the logged-in user
router.post('/', auth, createOrder);

// Fetch all orders for the logged-in user
router.get('/', auth, getUserOrders);

// Fetch a specific order by its ID
// router.get('/:id', auth, getOrderById);

// Update a specific order
router.put('/items/:id', auth, updateOrder);

// Delete a specific order
router.delete('/:id', auth, deleteOrder);

router.post('/success', auth, successOrder);


router.get('/items', auth, getOrderItemsForUser);
router.get('/seller', auth, getOrderItemsForSeller);


export default router;