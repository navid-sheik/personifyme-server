// token schema mongoose schema
import mongoose, { Schema } from "mongoose";



// likes : [{ type: Schema.Types.ObjectId, ref: 'Product' }],
// cart : [{ type: Schema.Types.ObjectId, ref: 'Product' }],
// orders : [{ type: Schema.Types.ObjectId, ref: 'Order' }],
// reviews : [{ type: Schema.Types.ObjectId, ref: 'Review' }],
// wishlist : [{ type: Schema.Types.ObjectId, ref: 'Product' }],
// address : [{ type: Schema.Types.ObjectId, ref: 'Address' }],
// payment : [{ type: Schema.Types.ObjectId, ref: 'Payment' }],

const BuyerSchema = new mongoose.Schema({
    random : {
        type: String,
        required: true,
        default : "random"
    }
    // orders : [{ type: Schema.Types.ObjectId, ref: 'Order' }],


    


})

const Buyer = mongoose.model('Buyer', BuyerSchema)

export default Buyer