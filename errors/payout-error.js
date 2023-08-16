import CustomError from "./custom-error.js";

class PayoutError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'Payout Error';
      this.statusCode = statusCode
    }
}

export default PayoutError;