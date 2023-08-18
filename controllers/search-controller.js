import SearchServices from '../services/searchServices.js';
import logger from '../logger/index.js';
import mongoose from 'mongoose';

export const performSearch = async (req, res, next) => {
    try {
        const user_id = req.user?._id; // Check this based on your setup, it may be req.user.id
        const query = req.query;
        const response = await SearchServices.filteredSearch(user_id, query);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getAllSearches = async (req, res, next) => {
    try {
        const response = await SearchServices.getAllSearches();
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


export const getSearchesFiltered = async (req, res, next) => {
    try {
        const query = req.query;
        const response = await SearchServices.searchQueries(query);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};