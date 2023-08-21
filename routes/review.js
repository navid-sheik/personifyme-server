import express from 'express';
import { getReviews, createReview, getReviewById, updateReview, deleteReview, getReviewsByProduct, getReviewForUser, getReviewForShop } from '../controllers/review-controller.js';
import { auth } from '../middleware/auth.js';

const router  = express.Router();

router.get('/', getReviews);
router.post('/', auth,  createReview);
router.get('/:id', getReviewById);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth,  deleteReview);
router.get('/product/:id', getReviewsByProduct);

router.get('/user/current', auth ,  getReviewForUser); // Fetch all reviews for the logged-in user
// router.get('/user/:id', getReviewForSpecificUser); // Fetch all reviews for a specific user by ID
router.get('/shop/:id', getReviewForShop); // Fetch all reviews for the logged-in seller's shop


export default router;