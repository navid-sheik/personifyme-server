import CustomError from "./custom-error.js";

class PaymentError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'Stripe Error';
      this.statusCode = statusCode
    }
}

export default PaymentError;