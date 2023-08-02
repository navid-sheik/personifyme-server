import mongoose from "mongoose";
import { nanoid } from "nanoid";

import bcrypt from "bcryptjs";
import logger from "../middleware/logger-handler.js";


const OptionSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Option Name is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Option Quantity is required'],
    },
    price: {
      type: Number,
      required: [true, 'Option Price is required'],
    },
    // Add other fields as necessary (like 'color', 'size', etc.)
  });
  
const VariationSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name  Variatiion is required'],
    },
    options: [OptionSchema],
  });


  const DeliverySchema = new mongoose.Schema({
    available: {
      type: Boolean,
      required: [true, 'Available Delivery  is required']
    },
    deliveryTime: {
      min: {
        type: Number,
        required: [true, 'Minimum delivery time is required']
      },
      max: {
        type: Number,
        required: [true, 'Maximum delivery time is required']
      }
    }
  });
  
  const ShippingInfoSchema = new mongoose.Schema({
    processingTime: {
      min: {
        type: Number,
        required: [true, 'Minimum processing time is required']
      },
      max: {
        type: Number,
        required: [true, 'Maximum processing time is required']
      }
    },
    originCountry: {
      type: String,
      required: [true, 'Origin country is required']
    },
    destinationCountry: {
      type: String,
      required: [  true, 'Destination country is required']
    },
    internationalDelivery: DeliverySchema,
    standardDelivery: {
      type: DeliverySchema,
      required: [true, 'Standard delivery is required']
    }
  });
  
const ProductSchema = new mongoose.Schema({

    seller_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required:  [true, 'Seller is required']
    },
    title : {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 100
    },

    description : {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: 1000
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        min: [0 , 'Price must be greater than 0'],
        max: [Number.MAX_SAFE_INTEGER, 'Price must be less than 9223372036854775807']


    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, 'Category is required']
    }, 
    customizationOptions: {
        type: [{
          field: {
            type: String,
            required: [true, 'Field is required']
          },
          instructions: {
            type: String,
            required:  [true, 'Instructions are required']
          },
          customizationType: {
            type: String,
            enum: ['File', 'Text'],
            required: [true, 'Customization type is required']
          }
        }],
        validate: [arrayLimit, '{PATH} exceeds the limit of 3 entries']
    },
    sold : {
        type: Number,
        default: 0
    },
    images: {
        type: [String],
        required: [true, 'Product images are required'],
       
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending', 'Rejected'],
        default: 'Active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    condition : {
        type: String,
        enum: ['New', 'Used'],
        default: 'New'
    },
    reviews: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
            }],
        
    },
    hasVariations: {
        type: Boolean,
        default: false
    },
    variations: [VariationSchema],
    shippingInfo: ShippingInfoSchema,
    returnPolicy: {
        type: Boolean,
        required: [true, 'Return policy is required']
    },
    shippingPolicy: {
        type: Boolean,
        required: [true, 'Shipping policy is required']
    
    },















}, { timestamps: true });


function arrayLimit(val) {
    return val.length <= 3;
  }



const Product = mongoose.model("Product", ProductSchema);
export default Product;