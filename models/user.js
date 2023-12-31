import mongoose from "mongoose";
import { nanoid } from "nanoid";

import bcrypt from "bcryptjs";




const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true,

        minlength: [3, 'Enter a valid name with at least 3 characters'],
       
    },
    image : {
        type : String,
    },
    email: {
        type: String,
        required: [true, 'Please provide your email address'],
        trim: true,
        unique: [true, 'Email already taken'],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },

    username : {
        type: String,
        required: [true, 'Please provide a username'],
        trim: true,
        unique: [true, 'Username already taken'],
        lowercase: true,
    },
    role: {
        type: String,
        enum: ["user", "moderator", "admin"],
        default: "user",

    },
    verified: {
        type: Boolean,
        default: false,
    },
    verification_token: {
        type: String,
    },
    expire_verification_token: {
        type: Date,
    },

    reset_password_token: {
        type: String,
    },
    reset_password_expires: {
        type: Date,
    },
    seller_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
    },

    likes : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'Product',
        default : [],

    }, 

    shopFollowed : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'Shop',
        default : [],
    },
    country : {
        type : String,
        default : 'United Kingdom',
    },

    stripe_customer_id : {
        type : String,
    },
    
    
    
}, { timestamps: true , versionKey: false});
     
UserSchema.pre("save",async function(next) {

    try {
        if (!this.isModified("password")) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }

});



UserSchema.methods.matchPassword = async function(password) {
    try{

        return await bcrypt.compare(password, this.password);
    }catch(error){
        throw error;
    }
   
};

UserSchema.methods.generateVerificationToken = async function() {
    try{
        const verification_token =  nanoid(6); 
        const expire_verification_token = Date.now() + 3600000; //expires in an hour
        this.verification_token = verification_token;
        this.expire_verification_token = expire_verification_token;
        await this.save();
        return verification_token;
    }catch(error){
        throw error;
    }
};

UserSchema.methods.validateVerificationToken = async function(token) {
    try{
        if ( token === this.verification_token && Date.now() < this.expire_verification_token){
            this.verified = true;
            this.verification_token = undefined;
            this.expire_verification_token = undefined;
            await this.save();
            return true;
        }
    }catch(error){
        throw error;
    }
};



const User = mongoose.model("User", UserSchema);

export default User;