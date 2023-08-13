import CustomError from "./custom-error.js";

class CartError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'Cart Error';
      this.statusCode = statusCode
    }
}

export default CartError;