
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

export const auth = async (req, res, next) => {

try {
    const autherization = req.header("Authorization");
    if (!autherization) {
        let response = errorResponse("Missing Authorization", 401, "JWT Auth Error");
        return res.status(401).json(response);
    }

    const token  = autherization.split(" ")[1];
    if (!token) {
        let response =  errorResponse("Missing Bearer Token", 401, "JWT Auth Error");
        return res.status(401).json(response);
    }

    console.log(token);



    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload.userId;
    next();
}
catch (error) {
    console.log(error.message);
    next(error);
}

}
