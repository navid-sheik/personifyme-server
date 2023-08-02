import express from 'express';
import { getReviews, createReview, getReviewById, updateReview, deleteReview, getReviewsByProduct } from '../controllers/review-controller.js';
import { auth } from '../middleware/auth.js';

const router  = express.Router();

router.get('/', getReviews);
router.post('/', auth,  createReview);
router.get('/:id', getReviewById);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth,  deleteReview);
router.get('/product/:id', getReviewsByProduct);

export default router;