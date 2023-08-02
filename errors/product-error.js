import CustomError from "./custom-error.js";

class ProductError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'Item Error';
      this.statusCode = statusCode
    }
}

export default ProductError;