
import User from "../models/user.js"; 
import  jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import logger from "../logger/index.js";
import RefreshToken from "../models/refresh-token.js";
import {v4 as uuidv4} from "uuid";
import { randomUUID } from "crypto"
import { sendEmail } from "../utils/sendEmail.js";
import Token from "../models/token.js";



export const signup = async (req, res, next) => {


    try{

        let { name, email, password, username } = req.body;
        if (!name || !email || !password || !username) {
            return res.status(400).json({ errors: [{ message: "Please fill all the fields" }] });
        }

        let user = await  User.findOne({ email });
        if (user){
            return res.status(400).json({ errors: [{ message: "User already exists" }] });
        }
        user = new User({ name, email, password, username });
        await user.save();


        //Generate a JWT token
        const payload = { userId : user._id };
        const token  = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Create a refresh token
        const refreshToken = new RefreshToken({
            user: user._id,
            token: uuidv4(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 1 week
        });

        await refreshToken.save();



        //Send first verification in order to verify the email
        // const verification_token = await user.generateVerificationToken();
        // console.log(verification_token);

        // // const verificationUrl = `${process.env.MOBILE_URL}/verify/${verification_token}`;
        // await sendEmail({email : user.email, subject: "Email Verification", message : `This is your verification code ${verification_token}`});

        //Send the token to the user
        res.status(202).json({  verified: user.verified , token, refreshToken: refreshToken.token });


    }catch(error){
        console.log(error);
        logger.error('Something wrong in signup controller');
        next(error);
      

    }

}


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials, email doesn\'t exits ' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // if (!user.verified) {
        //     return res.status(400).json({ is_verified: user.verified,  message: 'Please verify your email to continue' });
        // }

        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });



        
        // Delete any existing refresh tokens for the user
        await RefreshToken.findOneAndDelete({ user: user._id})
    

        const refreshToken = new RefreshToken({
            user: user._id,
            token: uuidv4(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 1 week
        });

        await refreshToken.save();

        res.json({ verified: user.verified , token, refreshToken: refreshToken.token });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};


export const requestVerificationCode = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log(email);
        const user  =  await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const verification_token = user.verification_token;
        const expire_verification_token = user.expire_verification_token;
        
        logger.error({verification_token, expire_verification_token});
        const new_verification_token = await user.generateVerificationToken();
        // const verificationUrl = `http://localhost:3000/verify/${new_verification_token}`;
        await sendEmail({email : user.email, subject: "Email Verification", message : `This is your verification code ${new_verification_token}`});
        res.status(200).json({ success:  true, message: 'Verification code sent successfully' });


    }catch(error){
        console.log(error.message);
        next(error);
    }
}



export const verifyAccount = async (req, res, next) => {
    try {
        const { verification_token, email} = req.body;
        const  user  = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const is_verified = user.validateVerificationToken(verification_token)
        if (is_verified){
            const payload = { userId: user._id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    
    
            
            // Delete any existing refresh tokens for the user
            await RefreshToken.findOneAndDelete({ user: user._id})
        
    
            const refreshToken = new RefreshToken({
                user: user._id,
                token: uuidv4(),
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 1 week
            });
    
            await refreshToken.save();
    
            res.json({verified: user.verified ,  token, refreshToken: refreshToken.token });
        }
        else{
            res.status(400).json({ message: 'Invalid verification code, request new code' });
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }

}
export const checkVerifedStatus  =  async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Assume the token is sent in the Authorization header
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
      const user = await User.findById(userId);
  
      // Return the user's verified status
      if (!user.verified){
        //  Send first verification in order to verify the email
        const verification_token = await user.generateVerificationToken();
        console.log(verification_token);

        // const verificationUrl = `${process.env.MOBILE_URL}/verify/${verification_token}`;
        await sendEmail({email : user.email, subject: "Email Verification", message : `This is your verification code ${verification_token}`});
        return res.status(202).json({ verified: user.verified, message : 'Verifcation email sent, please check your email ' });

      }
      
      res.json({ verified: user.verified,  });
    } catch (error) {
        return  res.status(401).json({ message: "Unauthorized" });
    }
};



export const token = async (req, res, next) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const refreshTokenDoc = await RefreshToken.findOne({ token: refreshToken });

        if (!refreshTokenDoc) {
            return res.status(401).json({ message: 'Token not found. Please sign in again.' });
        }

        if (refreshTokenDoc.expires < Date.now()) {
            return res.status(401).json({ message: 'Token expired. Please sign in again.' });
        }

        const payload = { userId: refreshTokenDoc.user };
        const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30s' });

        res.json({ token: newToken });
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
};


export const sendPasswordResetLink = async (req, res) =>{
    try {

        const {email} = req.body
        let user  =  await User.findOne({email : email})
        if (!user){
            return res.status(404).json({success: false, message : "User doesn't exists  "})
        }
        let token = await Token.findOne({userId : user._id})
        if (token){
            await token.deleteOne()
        }
        
        token = await new Token({userId : user._id, type : "reset-password",token : randomUUID()}).save()
        
        const url =  `${process.env.BASE_MOBILE_URL}password-reset/${user._id}/${token.token}`
        await  sendEmail({email : user.email, subject : "Reset Password", message :  url })
        res.status(200).json({success: true, message : "Email sent successfully "})

    } catch (error) {
        res.status(500).json({success: false, message : "Something failed "})
    }
}

export const verifyPasswordResetLink = async (req, res) =>{
    try {
        const user  =  await User.findById(req.params.id)
        const existing_toke  = req.params.token
        if (!user){       
            return res.status(404).json({success: false, message : "User doesn't exists  "})
        }

        const token  =  await Token.findOne({userId : user._id, token : req.params.token})
        if (!token){
            return res.status(404).json({success: false, message : "Token doesn't exists  "})
        }

        res.status(200).json({success: true, message : "Token is valid  "})
        
    } catch (error) {
        res.status(500).json({success: false, message : "Something failed "})
        
    }

}

export const resetPassword = async (req, res) =>{
    try {
        const {password} = req.body

        const user  =  await User.findById(req.params.id)
        if (!user){       
            return res.status(404).json({success: false, message : "User doesn't exists  "})
        }

        const token  =  await Token.findOne({userId : user._id, token : req.params.token})
        if (!token){
            return res.status(404).json({success: false, message : "Token doesn't exists  "})
        }


        user.password = password
        await user.save()
        await  token.deleteOne()
        res.status(200).json({success: true, message : "Password changed successfully  "})



    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success: false, message : "Something failed "})
    }

}



export const logout = async (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided.' });
    }

    try {
        // Invalidate the refresh token by removing it from the database
        await RefreshToken.findOneAndDelete({ token: refreshToken });
        
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};



export  const protectedRoute = async (req, res, next) => {
    try {

        console.log("somethin");
        const user = await User.findById(req.user.userId).select('-password');
        res.json({ user });
    } catch (error) {
        console.log(error.message);
        logger.error('Something wrong in protected route controller');
        // next(error);
    }
}