import dotenv from "dotenv";
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

const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');



//Initializing express app
const app = express();


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
