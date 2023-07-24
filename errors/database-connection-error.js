// import CustomError from "./custom-error";


// export class DatabaseConnection  extends CustomError{
//     statusCode = 500;
//     reason = "Error connecting to database";

//     constructor(){
//         super("Error connecting to database");

//         Object.setPrototypeOf(this, DatabaseConnection.prototype);
//     }

//     serializeErrors(){
//         return [
//             {message: this.reason}
//         ]
//     }
// }