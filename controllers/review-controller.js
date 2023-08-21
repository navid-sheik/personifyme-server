import { successResponse } from '../utils/response.js';
import ReviewService from '../services/reviewService.js';

export const getReviews = async (req, res, next) => {
    try {
        const response = await ReviewService.getReviews();
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const createReview = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await ReviewService.createReview(user_id, req.body);
        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
}

export const getReviewById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const response = await ReviewService.getReviewById(id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const updateReview = async (req, res, next) => {
    try {
        const user_id = req.user;
        const id = req.params.id;
        const response = await ReviewService.updateReview(user_id, id, req.body);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        const user_id = req.user;
        const id = req.params.id;
        const response = await ReviewService.deleteReview(user_id, id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getReviewsByProduct = async (req, res, next) => {
    try {
        const id = req.params.id;

        const response = await ReviewService.getReviewsByProduct(id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


export const getReviewForUser = async (req, res, next) => {
    try {
        //Alternative user params
        const userId = req.user
        const response = await ReviewService.getAllReviewFromUser(userId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


export const getReviewForShop = async (req, res, next) => {
    try {
        const seller_id  =  req.params.id;
        const response = await ReviewService.getReviewForShop(seller_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};