import mongoose from "mongoose";
import { nanoid } from "nanoid";

import bcrypt from "bcryptjs";
import logger from "../middleware/logger-handler.js";

const CategorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    description: String
    // other fields you might want to include
  });
  
const Category = mongoose.model('Category', CategorySchema);
export default Category;