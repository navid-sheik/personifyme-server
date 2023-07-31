import CustomError from "./custom-error.js";

class AuthError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'JwtError';
      this.statusCode = statusCode
    }
}

export default AuthError;