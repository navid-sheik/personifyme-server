
import jwt from "jsonwebtoken";
export const auth = async (req, res, next) => {

    const token  = req.header("Authorization").split(" ")[1];

    console.log(token);
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        console.log(error.message);
       next(error);
    }

}