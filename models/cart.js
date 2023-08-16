import mongoose from "mongoose";
import Product from "./product.js";
import toStripeAmount from "../utils/stripe.js";
import Payout from "./payout-schema.js";



export const VariantSchema = new mongoose.Schema({
    variant: {
      type: String,
      required: [true, 'Name  Variatiion is required'],
    },
    value: {
        type: String,
        required: [true, 'Value is required'],
    },
  } ,  { versionKey: false, _id : false});


const CartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
  

    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity should be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price should be positive']
    },
    hasVariations: {
        type: Boolean,
        default: false
    },
   



    variations: [VariantSchema],
    customizationOptions: [String]
}, { timestamps: true, versionKey: false });

CartItemSchema.virtual('total').get(function() {
    return this.price * this.quantity;
});



const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // This references the Buyer model
    },
    items: [CartItemSchema]
}, {timestamps: true, versionKey: false });


CartSchema.methods.calculateGrandTotal = async function() {
    const productIds = this.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    let grandTotal = 0;
    
    for (const product of products) {
        const item = this.items.find(i => i.productId.toString() === product._id.toString());
        const individualTotal = product.price * item.quantity;
        grandTotal += individualTotal;
    }
    
    return toStripeAmount(grandTotal);
};

CartSchema.methods.organizeProductsBySeller = async function() {
    const productIds = this.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).populate('seller_id');
    const sellersMap = {};
    
    for (const product of products) {
        const item = this.items.find(i => i.productId.toString() === product._id.toString());
        const individualTotal = product.price * item.quantity;
        const sellerStripeId = product.seller_id.stripe_account_id;
        const sellerId = product.seller_id._id; // seller_id field is assumed to be populated

        if (!sellersMap[sellerStripeId]) {
            sellersMap[sellerStripeId] = {
                sellerId: sellerId,
                stripeId: sellerStripeId,
                subTotal: 0,
                items: []
            };
        }
        
        sellersMap[sellerStripeId].subTotal += individualTotal;
        sellersMap[sellerStripeId].items.push({
            productId: product._id,
            quantity: item.quantity
        });
    }

    // Convert the subTotal for each seller to cents using toStripeAmount function
    for (const sellerStripeId in sellersMap) {
        sellersMap[sellerStripeId].subTotal = toStripeAmount(sellersMap[sellerStripeId].subTotal);
    }
    
    return Object.values(sellersMap);
};

CartSchema.methods.createPayoutsForSellers = async function(newOrder, orderItems) {
    const organizedProducts = await this.organizeProductsBySeller();
    const payouts = [];
    console.log(organizedProducts);

    for (const sellerInfo of organizedProducts) {
        // Initialize a new Payout instance
       
        const payout = new Payout({
            sellerId: sellerInfo.sellerId, // Assuming sellerId is a field in sellerInfo
            orderId: newOrder._id,
            stripe_id_seller: sellerInfo.stripeId,
            trasactionId: newOrder.transactionId,
            orderItems: orderItems[sellerInfo.sellerId],
            grossAmount: sellerInfo.subTotal,
            amountWithCommission: 0, // Will be calculated below
            commission: 0 // Will be calculated below
        });
    
        // Calculate the commission: 10% of grossAmount
        payout.commission = payout.grossAmount * 0.10; 
    
        // Calculate the amount after commission is deducted: grossAmount - commission
        payout.amountWithCommission = payout.grossAmount - payout.commission;
    
        // Save the Payout instance to the database (if desired)
        try {
            await payout.save();
        } catch (error) {
            console.error(error);
            throw error;
        }
    
        // Add the Payout instance to the payouts array
        payouts.push(payout);
    }

    // Return the array of Payout instances (either saved or unsaved, based on your need)
    return payouts;
};


const Cart = mongoose.model('Cart', CartSchema);
export default Cart;