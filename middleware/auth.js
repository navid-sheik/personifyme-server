
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";
import User from "../models/user.js";

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


export const moderatorAuth = async (req, res, next) => {
    try {
        // First, authenticate the user normally
        await auth(req, res, async () => {
            // After successful authentication, check if the user is a moderator
            const userId = req.user;
            const user = await User.findById(userId);

            if (!user) {
                let response = errorResponse("User not found", 404, "User Error");
                return res.status(404).json(response);
            }

            if (user.role !== "moderator") {
                let response = errorResponse("Unauthorized: Not a moderator", 403, "Authorization Error");
                return res.status(403).json(response);
            }

            // If we reach this point, the user is authenticated and is a moderator
            next();
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}