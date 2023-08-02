import ProductService from '../services/productServices.js';
import logger from '../logger/index.js';


export const getProducts = async (req, res, next) => {
    try {
        const response = await ProductService.getProducts();
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {

    try {
        const user_id = req.user;
        const response = await ProductService.createProduct(user_id, req.body);
        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
}

export const getProductById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const response = await ProductService.getProductById(id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


export const updateProduct = async (req, res, next) => {
    try {
        const user_id = req.user;
        const id = req.params.id;
        const response = await ProductService.updateProduct(user_id, id, req.body);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next ) => {
    try {
        const user_id = req.user;
        const id = req.params.id;
        const response = await ProductService.deleteProduct(user_id,id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};