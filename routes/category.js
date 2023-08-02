import express from 'express';
import { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory, getProductsByCategory, getSubcategories, getParentCategories } from '../controllers/category-controller.js';
import { auth } from '../middleware/auth.js';
const router  = express.Router();

router.get('/parents', getParentCategories);

router.get('/', getCategories);
router.post('/', auth,  createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth,  deleteCategory);
router.get('/:id/products', getProductsByCategory);
router.get('/:id/subcategories', getSubcategories);

export default router;