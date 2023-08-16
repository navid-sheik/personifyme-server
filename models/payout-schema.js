

import mongoose from "mongoose";
import { nanoid } from "nanoid";

import bcrypt from "bcryptjs";
import logger from "../middleware/logger-handler.js";

const PayoutSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true


    },

    stripe_id_seller: {
        type: String,
        required: true
    },
    trasactionId :{
        type: String,
        required: true,
    },
    transferId :{
        type: String,
    },

    orderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    orderItems : {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'OrderItem',
        required: true
    },

    grossAmount: {
        type: Number,
        required: true
    },
    amountWithCommission: {
        type: Number,
        required: true
    },
    commission: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'completed', "failed"],
        default: 'created',
        require: true
    },
    

  },  { timestamps: true, versionKey: false});
  
const Payout = mongoose.model('Payout', PayoutSchema);
export default Payout;