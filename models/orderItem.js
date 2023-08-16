// token schema mongoose schema
import mongoose, { Schema } from "mongoose";
export const VariantOrderSchema = new mongoose.Schema({
    variant: {
      type: String,
      required: [true, 'Name  Variatiion is required'],
    },
    value: {
        type: String,
        required: [true, 'Value is required'],
    },
  } ,  { versionKey: false, _id : false});


const AddressSchema = new mongoose.Schema({
    line1: {
        type: String,
        required: true
    },
    line2: {
        type: String,
    },
    country: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    name: {
        type: String,
    },
    phone: String,
 
}, { versionKey: false, _id : false});

const OrderItemSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },
    seller : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    shippingDetails: AddressSchema,
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    

    quantity: {
        type: Number,
        required: true
    },
    status : {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
        default: 'Processing',
    },
    price: { 
        type: Number,
        required: true
    },
    variant: [VariantOrderSchema],
    customizationOptions:[String],
    total: {
        type: Number,
        required: true
    },
    shippedAt : Date,
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    tracking: {
        trackingNumber :{
            type: String,
        },
        carrier: {
            type: String,
        }, 
        trackingUrl: String
    }
   

    

}, { versionKey: false , timestamps: true});

const OrderItem = mongoose.model('OrderItem', OrderItemSchema);

export default OrderItem;