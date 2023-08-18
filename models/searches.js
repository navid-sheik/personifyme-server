import mongoose from "mongoose";

const SearchQuerySchema = new mongoose.Schema({
    query: {
        type: String,
        required: true
    },

    count: {
        type: Number,
        default: 1
    }

}, { timestamps: true, versionKey: false});

const Search = mongoose.model('Search', SearchQuerySchema)

export default Search