// token schema mongoose schema
import mongoose, { Schema } from "mongoose";

// userId : {
//     type: Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//     unique: true
// },

 // stripeAdditionalRequirements: {
    //     currently_due: [],
    //     eventually_due: [],
    //     past_due: [],
    //     pending_verification: [],
        
    // },

const SellerSchema = new mongoose.Schema({

    userId : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    

    

    stripe_account_id : { type : String, required: true},
    is_verifed : { type : Boolean, required: true, default: false},
   

    hasStartedOnboarding: {
        type: Boolean,
        default: false,
      },
    
    hasCompletedOnboarding: {
        type: Boolean,
        default: false,
      },

    origin_country : { type : String, required: true},
    shopId :{
        type: Schema.Types.ObjectId,
        ref: 'Shop',
    }


}, { timestamps: true , versionKey: false});

const Seller = mongoose.model('Seller', SellerSchema)

export default Seller