import express from 'express';
import { performSearch, getAllSearches, getSearchesFiltered } from '../controllers/search-controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Endpoint to perform a search
// This assumes that performing a search might require a user to be authenticated
router.get('/perform', performSearch);

// Endpoint to get all searches
// This assumes that getting all searches is an admin feature, requiring authentication
router.get('/all', getAllSearches);
router.get('/filter', getSearchesFiltered);

// ... you can add more search-related routes here ...

export default router;