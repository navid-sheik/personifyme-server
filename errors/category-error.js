import CustomError from "./custom-error.js";

class CategoryError extends CustomError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = 'Category Error';
      this.statusCode = statusCode
    }
}

export default CategoryError;