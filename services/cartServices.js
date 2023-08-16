import Cart from "../models/cart.js";
import Product from "../models/product.js";
import AuthError from "../errors/auth-error.js";
import CartError from "../errors/cart-error.js";
import User from "../models/user.js";
import { successResponse } from '../utils/response.js';

export default class CartService {

    static async addToCart(user_id, cartItemData) {
        // Verify if user exists
        let user = await User.findById(user_id);
        if (!user) {
            throw new AuthError('User not logged in', 401);
        }

        // Ensure the product exists
        let product = await Product.findById(cartItemData.productId);
        if (!product) {
            throw new CartError('Product not found', 404);
        }

        // Fetch the user's cart or create a new one if it doesn't exist
        let cart = await Cart.findOne({ userId: user_id });
        if (!cart) {
            cart = new Cart({ userId: user_id });
        }

        // Update quantity if product is already in cart; else add new item
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === product._id.toString());
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += cartItemData.quantity;
        } else {
            cart.items.push(cartItemData);
        }

        await cart.save();

        let cart_to_return = await Cart.findOne({ userId: user_id }).populate({path: 'items.productId', select: 'title images' });

        return successResponse("Item added to cart successfully", cart_to_return);
    }

    static async get(itemId) {
        // 1. Fetch a cart that contains the item with the given itemId
        const cart = await Cart.findOne({ "items._id": itemId }).populate({path: 'items.productId', select: 'title images' });
        // const cart = await Cart.findOne({ "items._id": itemId });
        if (!cart) {
            throw new CartError('Cart not found', 404);
        }
    
        // 2. Iterate through the cart items to find the specific item
        const item = cart.items.find(item => item._id.toString() === itemId);
    
        if (!item) {
            throw new CartError('Cart item not found', 404);
        }
    
        // 3. Return the item
        return successResponse("Cart item fetched successfully", item);
    }

    static async getCart(user_id) {
        const user = await User.findById(user_id);
        if (!user) {
            throw new AuthError('User not logged in', 401);
        }

        const cart = await Cart.findOne({ userId: user_id }).populate({path: 'items.productId', select: 'title images' });
        // const cart = await Cart.findOne({ userId: user_id })
        if (!cart) {
            throw new CartError('Cart not found', 404);
        }

        return successResponse("Cart fetched successfully", cart);
    }

    static async updateCartItem(user_id, itemId, itemData) {
        const cart = await Cart.findOne({ userId: user_id });
        if (!cart) {
            throw new CartError('Cart not found', 404);
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            throw new CartError('Cart item not found', 404);
        }

        // Update cart item
        for (let key in itemData) {
            cart.items[itemIndex][key] = itemData[key];
        }
        await cart.save();

        let cart_to_return = await Cart.findOne({ userId: user_id }).populate({path: 'items.productId', select: 'title images' });
        return successResponse("Cart item updated successfully", cart_to_return);
    }

    static async removeFromCart(user_id, itemId) {
        const cart = await Cart.findOneAndUpdate(
            { userId: user_id },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );
        
        if (!cart) {
            throw new CartError('Cart not found', 404);
        }
        let cart_to_return = await Cart.findOne({ userId: user_id }).populate({path: 'items.productId', select: 'title images' });
        return successResponse("Item removed from cart successfully", cart_to_return);
    }

    static async emptyCart(user_id) {
        const cart = await Cart.findOne({ userId: user_id });
        if (!cart) {
            throw new CartError('Cart not found', 404);
        }

        cart.items = [];
        await cart.save();

        return successResponse("Cart emptied successfully");
    }

    static async checkout(user_id) {
        // For the purpose of this demonstration, this method is a placeholder for the checkout logic
        return successResponse("Checkout successful");
    }
}