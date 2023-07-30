// token schema mongoose schema
import mongoose, { Schema } from "mongoose";



const OrderSchema = new mongoose.Schema({
    buyer : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Buyer',
        unique: true
    },
    seller : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Seller',
        unique: true
    },
    


    


})

const Order = mongoose.model('Order', OrderSchema)

export default Order