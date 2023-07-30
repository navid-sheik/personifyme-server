import Seller from "../models/selller-account.js"



export const getSellerAccount = async (req, res) => {
    const user_id  = req.user

    try{

        const seller  =  await Seller.findOne({ userId : user_id})
        return res.status(200).json({ success : true,  result : {id : seller._id, hasStartedOnboarding : seller.hasStartedOnboarding, hasCompletedOnboarding : seller.hasCompletedOnboarding}});
    }

    catch (error) {
        console.log(error.message);
        return res.status(400).json({  success : false, error : error.message });
    }

}