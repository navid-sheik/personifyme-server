import mongoose from "mongoose";
import { nanoid } from "nanoid";

import bcrypt from "bcryptjs";
import logger from "../middleware/logger-handler.js";






const CommissionSchema = new mongoose.Schema({
    orderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    commissionAmount : {
        type: Number,
        required: true,
    } 

    // other fields you might want to include
  } );
  
const Commission = mongoose.model('Commission', CommissionSchema);
export default Commission;