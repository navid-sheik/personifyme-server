import mongoose from "mongoose";



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

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;