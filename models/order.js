// token schema mongoose schema
import mongoose, { Schema } from "mongoose";
import OrderItem from "./orderItem.js";







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

const PaymentSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['CreditCard', 'PayPal', 'Crypto', 'BankTransfer'],
        default : 'CreditCard',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default : 'Pending',
        required: true
    },
    failedReason: String,
    transactionId: {
        type: String,
    }
} , { versionKey: false, _id : false});




const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    orderItems: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'OrderItem',

    },
    shippingDetails: AddressSchema,
    // paymentDetails: PaymentSchema,
    transactionId : String,
    orderStatus: {
        type: String,
        enum: ['Pending', 'Paid' , 'Processing', 'Processing',  'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
        default : 'Paid',
    },
    orderTotal: {
        type: Number,
        required: true
    },
    taxAmount : {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    

} , { timestamps: true, versionKey: false});

const Order = mongoose.model('Order', orderSchema);

export default Order;

// const SellerItemSchema = new mongoose.Schema({
//     sellerId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Seller',
//         required: true
//     },
//     orderItems: [OrderItemSchema],
// } , { versionKey: false, _id : false});
