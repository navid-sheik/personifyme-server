// token schema mongoose schema
import mongoose, { Schema } from "mongoose";



const orderItemSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: { 
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
});

const shippingSchema = new mongoose.Schema({
    addressLine1: {
        type: String,
        required: true
    },
    addressLine2: String,
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: String,
    trackingNumber: String,
    carrier: String
});

const paymentSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['CreditCard', 'PayPal', 'Crypto', 'BankTransfer'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        required: true
    },
    transactionId: String
});

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingDetails: shippingSchema,
    paymentDetails: paymentSchema,
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        required: true
    },
    orderTotal: {
        type: Number,
        required: true
    },
    taxAmount: Number,
    shippingCost: Number,
    discount: Number,
    placedAt: {
        type: Date,
        default: Date.now
    },
    shippedAt: Date,
    deliveredAt: Date,
    notes: String
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;