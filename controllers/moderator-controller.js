import ModeratorService from '../services/moderatorServices.js';
import logger from '../logger/index.js';



export const approveItem = async (req, res, next) => {
    try {
        const moderatorId = req.user;  // Assuming user's id is stored in req.user
        const productId = req.params.id;  // Assuming product id is sent in URL
        const response = await ModeratorService.approveItem(moderatorId, productId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const disapproveItem = async (req, res, next) => {
    try {
        const moderatorId = req.user;
        const { id } = req.params;
        const { message } = req.body;
        const response = await ModeratorService.disapproveItem(moderatorId, id, message);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getAllUnverifiedProducts = async (req, res, next) => {
    try {
        const response = await ModeratorService.getAllUnverifiedProducts();
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};