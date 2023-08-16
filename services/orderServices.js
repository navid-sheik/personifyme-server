import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import OrderError from "../errors/order-error.js";
import { successResponse } from '../utils/response.js';
import Payout from "../models/payout-schema.js";
import Cart from "../models/cart.js";
import OrderItem from "../models/orderItem.js";

import Stripe from 'stripe';
import CartError from "../errors/cart-error.js";
import CartService from "./cartServices.js";
import Seller from "../models/seller-account.js";
import mongoose from "mongoose";
const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');


export default class OrderService {

    static async createOrder(user_id, orderData) {
        let user = await User.findById(user_id);
        if (!user) {
            throw new OrderError('User not found', 401);
        }

        for (let item of orderData.orderItems) {
            let product = await Product.findById(item.product);
            if (!product) {
                throw new OrderError(`Product ${item.product} not found`, 404);
            }
        }

        orderData.user = user_id;

        const order = new Order(orderData);
        await order.save();

        return successResponse("Order created successfully", order);
    }

    static async getOrderById(orderId) {
        const order = await Order.findById(orderId)
                                 .populate('user')
                                 .populate('orderItems.product')
                                 .populate('orderItems.seller');

        if (!order) {
            throw new OrderError('Order not found', 404);
        }

        return successResponse("Order fetched successfully", order);
    }

    static async updateOrderItem(userId, orderId, orderData) {
       
        const seller  =  await Seller.findOne({userId : userId});
        if (!seller) {
            throw new OrderError('Seller not found', 404);
        }

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            throw new OrderError('Invalid order ID', 400);
        }

        if (orderData.tracking) {
            // Add another field to orderData
            orderData.status = "Shipped";
        }
    
        console.log(orderData)

        const options = { new: true, runValidators: true };
        let order = await OrderItem.findOneAndUpdate({ _id: orderId }, orderData, options);
      
        if (!order) {
            throw new OrderError('Order not found', 404);
        }
         // Populate the Product information in the order
        order = await order.populate('product');

        
        


        return successResponse("Order updated successfully", order);
    }

    static async deleteOrder(orderId) {
        let order = await Order.findById(orderId);

        if (!order) {
            throw new OrderError('Order not found', 404);
        }

        await order.remove();

        return successResponse("Order deleted successfully");
    }

    static async getOrdersForUser(user_id) {
        let user = await User.findById(user_id);
        
        if (!user) {
            throw new OrderError('User not found', 404);
        }

        const orders = await Order.find({ userId: user_id })
                                  .populate('orderItems.product')
                                  .populate('orderItems.seller');
        
        return successResponse("Orders fetched successfully", orders);
    }

    static async getOrdersForSeller(seller_id) {
        const orders = await Order.find({ 'orderItems.seller': seller_id })
                                  .populate('orderItems.product')
                                  .populate('orderItems.seller')
                                  .populate('user');
        
        return successResponse("Orders fetched successfully for seller", orders);
    }


    static async getOrderItemsForSeller(user_id) {
        const seller = await Seller.findOne({userId : user_id});

        if (!seller) {
            throw new OrderError('Seller not found', 404);
        }


        const orders = await OrderItem.find({ 'seller': seller._id }).populate('product');
        if (!orders) {
            throw new OrderError('Order not found', 404);
        }
        return successResponse("Orders fetched successfully for seller", orders);
    }

    static async getOrderItemsForBuyers(user_id) {

        let user = await User.findById(user_id);
        if (!user) {
            throw new OrderError('User not found', 404);
        }

        const orders = await OrderItem.find({ 'userId': user_id }).populate('product');
        if (!orders) {
            throw new OrderError('Order not found', 404);
        }
        return successResponse("Orders fetched successfully for buyers", orders);
    }




    static async successCheckout(user_id, orderData) {

        const cart = await Cart.findOne({ userId: user_id })
        if (!cart) {
            // Handle case where no cart is found for the user
            console.error("No cart found for user:", user_id);
            return;
          }
        
        //Create order items from cart
        
        const stripeTotal = await cart.calculateGrandTotal();
        // const sellers = await cart.organizeProductsBySeller();
        // console.log(stripeTotal)
        // console.log(sellers)

        const {shippingDetails } = orderData;
        const orderItems = await this.createOrderItemsFromCart(cart._id, shippingDetails );
        const orderItemIds = orderItems.map(orderItem => orderItem._id);

          console.log(orderItems)
            console.log(orderItemIds)
        const ordersGroupedBySeller = await this.groupOrdersBySeller(orderItems);
        
        // console.log(ordersGroupedBySeller); // For debugging: log the grouping to the console



        //Update the order the status  to success, shippingDetails, paymentDetails, orderStatus(Processing), orderTotal, taxAmount, shippingCost, trackingNumber, shippedAt
        //deliveredAt

        const newOrder  =  new Order ({...orderData,   userId: user_id,   orderItems : orderItemIds, user : user_id, orderTotal : stripeTotal})
        await newOrder.save();

        if (!newOrder){
            throw new OrderError('Order not created', 404);
        }
        // const orders = await Order.find({ 'orderItems.seller': seller_id, status: 'success' })
        //                           .populate('orderItems.product')
        //                           .populate('orderItems.seller')
        //                           .populate('user');

        //Update the item orders to success 

        //Get the items from the order
        //Calculate the total amount  and commission and amount deducted and store in the payout amount 
        //Update the payout table with the amount and commission
        //Update the order status to payout

        const payouts = await cart.createPayoutsForSellers( newOrder, ordersGroupedBySeller);
        if (!payouts){
            throw new OrderError('Payouts not created', 404);
        }
        // console.log(payouts); // For debugging: log the payouts to the console
        
        this.processPayouts(payouts);
        //Empty cart based on the item orders
        //Update the order status to success
    
        //Scehdule the payment to sellers for now 

        const emptyCart =  CartService.emptyCart(user_id);
        if(emptyCart.status == "success"){
            print("Emptied cart successfully")
            
        }else {
            // throw new CartError('Cart not emptied', 404);
        }





        return successResponse("Orders fetched successfully for seller", newOrder);



        
    }




    static async failCheckout(seller_id, order) {

        //Update the order the status  to success, shippingDetails, paymentDetails, orderStatus(Processing), orderTotal, taxAmount, shippingCost, trackingNumber, shippedAt
        //deliveredAt
        const orders = await Order.find({ 'orderItems.seller': seller_id, status: 'success' })
                                  .populate('orderItems.product')
                                  .populate('orderItems.seller')
                                  .populate('user');

        //Do something with the order details 






    }

    static async cancelCheckout(seller_id, order) {
        //Delete order
        //Delete Order items 

        //Make sure that when checkout is clicked and check if there is any any Order in process, if there is , we shouldn't crete a new order , but update the existing order and create the items neccssary
        //Deal with order details not used in the order items
    }

    static async  createOrderItemsFromCart(cart_id, shippingDetails) {
        // Assume cart is an object that has been populated with necessary fields
        // E.g., cart.items[0].productId should be a fully populated product object
        let cart = await Cart.findById(cart_id).populate('items.productId');
       
        const orderItemsArray = cart.items.map(cartItem => {
            console.log(cartItem);
            return {    
                userId : cart.userId,
                shippingDetails : shippingDetails,
                product: cartItem.productId._id,
                seller: cartItem.productId.seller_id, // Updated to seller_id
                quantity: cartItem.quantity,
                price: cartItem.price,

                variant: cartItem.variations.map(variation => ({
                    variant: variation.variant,
                    value: variation.value
                })),
                customizationOptions: cartItem.customizationOptions,
                total: cartItem.price * cartItem.quantity,
            };
        });
      
        try {
            // Save OrderItem documents to the database
            const savedOrderItems = await OrderItem.insertMany(orderItemsArray);
            return savedOrderItems;
      
        } catch (error) {
            console.error(error);
            throw error;
        }
      }

      static async  groupOrdersBySeller(orderItems) {
        const groupedBySeller = {};
    
        orderItems.forEach(orderItem => {
            const sellerId = orderItem.seller.toString();
    
            // If this sellerId doesn't already exist in our map, add it
            if (!groupedBySeller[sellerId]) {
                groupedBySeller[sellerId] = [];
            }
    
            // Push this orderItem to the appropriate seller's array
            groupedBySeller[sellerId].push(orderItem._id.toString());
        });
    
        return groupedBySeller;
    }

    static async  processPayouts(payouts) {
        // Loop through each payout object
        for (const payout of payouts) {
          try {
            const orderItemIdsString = payout.orderItems.join(', ');
            // Create a new Transfer on Stripe to pay the seller
            const transfer = await stripe.transfers.create({
              amount: payout.amountWithCommission,  // amount in cents
              currency: 'gbp', // set the currency
              destination: payout.stripe_id_seller, // the Stripe Connect Account ID of the seller
              transfer_group: payout.orderId.toString(),
              description: `Payout for order ${orderItemIdsString}`,
            });
      
            // Update the payout record in our database with the Stripe transfer ID and status
            payout.transferId = transfer.id;
            payout.status = 'pending';
            await payout.save();
      
            console.log(`Successfully transferred ${payout.amountWithCommission} to seller ${payout.sellerId}`);
      
          } catch (error) {
            // Handle the error appropriately
            console.error(`Failed to process payout for seller ${payout.sellerId}. Error: ${error.message}`);
            
            // Optionally update the payout record in our database with an error status
            payout.status = 'failed';
            await payout.save();
          }
        }
      }



      
    

      
}



