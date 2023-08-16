import CustomError from "./custom-error.js";

class OrderError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'Order Error';
      this.statusCode = statusCode
    }
}

export default OrderError;