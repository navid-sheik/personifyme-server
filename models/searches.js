import mongoose from "mongoose";

const SearchQuerySchema = new mongoose.Schema({
    query: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true, versionKey: false});

module.exports = mongoose.model('SearchQuery', SearchQuerySchema);