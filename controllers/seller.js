import Seller from "../models/seller-account.js"
import { errorResponse } from "../utils/response.js";



export const getSellerAccount = async (req, res) => {
    const user_id  = req.user

    try{

        const seller  =  await Seller.findOne({ userId : user_id})
        if (!seller){
            console.log(error.message);
            let response =  errorResponse(error.message, 400, "Seller Error")
             return res.status(400).json(response);
        }

        return res.status(200).json({ success : true,  result : {id : seller._id, hasStartedOnboarding : seller.hasStartedOnboarding, hasCompletedOnboarding : seller.hasCompletedOnboarding}});
    }

    catch (error) {
        console.log(error.message);
       let response =  errorResponse(error.message, 500, "Seller Error")
        return res.status(500).json(response);
    }

}