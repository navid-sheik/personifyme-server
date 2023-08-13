import express from 'express';
import { getCartByUser, addItemToCart, getCartItemById, updateCartItem, deleteCartItem, clearCart } from '../controllers/cart-controller.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

// Fetch the cart for the logged-in user
router.get('/', auth, getCartByUser);

// Add an item to the cart
router.post('/items', auth, addItemToCart);

// Fetch a specific cart item by its ID
router.get('/items/:id', auth, getCartItemById);

// Update a specific cart item
router.put('/items/:id', auth, updateCartItem);

// Delete a specific cart item
router.delete('/items/:id', auth, deleteCartItem);

// Clear out all items from the cart
router.delete('/', auth, clearCart);

export default router;