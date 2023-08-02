import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide a product id'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please login to add a review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a rating between 1 and 5'],
    },
    title: {
      type: String,
    },
    text: {
      type: String,
    },
    // other fields you might want to include...
  });
  
const Review = mongoose.model('Review', ReviewSchema);
export default Review;