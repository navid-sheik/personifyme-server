import CustomError from "./custom-error.js";

class SellerError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'Seller Error';
      this.statusCode = statusCode
    }
}

export default SellerError;