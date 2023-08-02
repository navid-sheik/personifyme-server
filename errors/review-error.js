import CustomError from "./custom-error.js";

class ReviewError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'JwtError';
      this.statusCode = statusCode
    }
}

export default ReviewError;