import dotenv, { populate } from "dotenv";
dotenv.config();
import express from "express";
import  "express-async-errors";
import cors from "cors";
import logger from "./logger/index.js";
import routes from "./routes/index.js";
import mongoose from "mongoose";
import errorHandler from "./middleware/error-handler.js";
import CustomError from "./errors/custom-error.js";

import Stripe from 'stripe';
import loggerHandler from "./middleware/logger-handler.js";
import Cart from "./models/cart.js";
import { auth } from "./middleware/auth.js";
import Product from "./models/product.js";
import Order from "./models/order.js";
import OrderItem from "./models/orderItem.js";
import toStripeAmount from "./utils/stripe.js";

const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');



//Initializing express app
const app = express();
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.use(express.json({limit: '50mb'})) // To parse the incoming requests with JSON payloads


//Middlewares
app.use(cors());
app.use(express.json());

//Routers
app.use("/", routes);




//Testing Routes
app.get("/", async(req, res) => {

    // throw new CustomError("This is another error", 404);
  res.json({ message: "Goood Morning Navid" });

});

// app.post('/payment-sheet', async (req, res) => {
//   // Use an existing Customer ID if this is a returning customer.
//   const customer = await stripe.customers.create();
//   const ephemeralKey = await stripe.ephemeralKeys.create(
//     {customer: customer.id},
//     {apiVersion: '2022-11-15'}
//   );
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: 1099,
//     currency: 'eur',
//     customer: customer.id,
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   res.json({
//     paymentIntent: paymentIntent.client_secret,
//     ephemeralKey: ephemeralKey.secret,
//     customer: customer.id,
//     publishableKey: 'pk_test_51NYyrYB6nvvF5Xeh38vBBJ9xWCtNKsSLuFexpx3A9nTpOAj9TZTLTRdRuo5cJbJusInPeXJo0LH1zoW3NHSDLtGZ00LrL4fvI5'
//   });
// });


const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};




app.get ('/calculateTotal',auth, async (req, res) => {
  let user_id = req.user

  const cart = await Cart.findOne({userId: user_id})
  if (!cart) {
    // Handle case where no cart is found for the user
    console.error("No cart found for user:", user_id);
    return;
  }
  const productIds = cart.items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).populate('seller_id');

  const sellersMap = {}; // to map sellers by their stripe_account_id
  let grandTotal = 0;

  for (const product of products) {
      const item = cart.items.find(i => i.productId.toString() === product._id.toString());
      const individualTotal = product.price * item.quantity;
      grandTotal += individualTotal;
      
      const sellerStripeId = product.seller_id.stripe_account_id;

      if (!sellersMap[sellerStripeId]) {
          sellersMap[sellerStripeId] = {
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

  const finalResult = {
      total: grandTotal,
      sellers: Object.values(sellersMap)
  };

  console.log(finalResult);
    



  
  
  res.json(cart);
})




app.post("/create-payment-intent",auth, async (req, res) => {


  // const customer = await stripe.customers.create();
  // const ephemeralKey = await stripe.ephemeralKeys.create(
  //   {customer: customer.id},
  //   {apiVersion: '2022-11-15'}
  // );
  let user_id = req.user
  

  const cart = await Cart.findOne({userId: user_id})
  if (!cart) {
    // Handle case where no cart is found for the user
    console.error("No cart found for user:", user_id);
    return;
  }

  const stripeTotal = await cart.calculateGrandTotal();
  const sellers = await cart.organizeProductsBySeller();
  console.log(stripeTotal)
  // console.log(sellers)
  sellers.forEach((seller, sellerIndex) => {
    console.log('Seller:', sellerIndex);
    seller.items.forEach((item, itemIndex) => {
        console.log('  Item:', item);
    });
});

 




  




 

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    
    

    

  
    amount: stripeTotal,
    currency: "gbp",
    automatic_payment_methods: {
      enabled: true,
    },

  }); 


  console.log(paymentIntent.id)

 // ephemeralKey: ephemeralKey.secret,
//  customer: customer.id,
  res.json({
    paymentIntent: paymentIntent.client_secret,
    payment_intent_id : paymentIntent.id,
    publishableKey: 'pk_test_51NYyrYB6nvvF5Xeh38vBBJ9xWCtNKsSLuFexpx3A9nTpOAj9TZTLTRdRuo5cJbJusInPeXJo0LH1zoW3NHSDLtGZ00LrL4fvI5'
  });
});



//Error Handler

// app.use(loggerHandler)
app.use(errorHandler)

// // Error handling middleware
// app.use((err, req, res, next) => {
//   res.status(500).json({ message: err.message });
// });



// Connection to database and starting server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
