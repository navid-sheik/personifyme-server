

import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
  } from '../controllers/product-controller.js';

const router  = express.Router();



// Get all products
router.get('/', getProducts);

// Get a single product by id
router.get('/:id', getProductById);

// Create a new product
router.post('/create',auth, createProduct);

// Update an existing product
router.put('/:id', auth , updateProduct);

// Delete a product
router.delete('/:id',auth, deleteProduct);



export default router;
