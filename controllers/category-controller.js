import CategoryService from '../services/categoryServices.js';
import logger from '../logger/index.js';

export const getCategories = async (req, res, next) => {
    try {
        const response = await CategoryService.getCategories();
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        
        const user_id  =  req.user
        const response = await CategoryService.createCategory(user_id, req.body);
        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
}

export const getCategoryById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const response = await CategoryService.getCategoryById(id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const user_id  =  req.user
        const id = req.params.id;
        const response = await CategoryService.updateCategory(user_id, id, req.body);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const user_id  =  req.user
        const id = req.params.id;
        const response = await CategoryService.deleteCategory(user_id, id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getProductsByCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const response = await CategoryService.getProductsByCategory(id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getSubcategories = async (req, res, next) => {
    try {
        const id = req.params.id;
        const response = await CategoryService.getSubcategories(id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }

};


export const getParentCategories = async (req, res, next) => {
    try {
       
        const response = await CategoryService.getParentCategories();
        return res.status(200).json(response);
    } catch (error) {
        next(error);
        logger.error(error);
    }
}


