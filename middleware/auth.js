
import jwt from "jsonwebtoken";
export const auth = async (req, res, next) => {

    const token  = req.header("Authorization").split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    console.log(token);


    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // if (err) {
        //     return res.status(401).json({ message: "Unauthorized" });
        // }
        req.user = payload.userId;
       
        next();
    }
    catch (error) {
        console.log(error.message);
        next(error);
    }

}