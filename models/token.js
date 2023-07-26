// token schema mongoose schema
import mongoose, { Schema } from "mongoose";


const TokeSchema = new mongoose.Schema({
    userId : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },

    type : { type : String, required: true},

    token : { type : String,  required: true},
    createdAt : { type : Date, required: true, default: Date.now, expires: 3600 }

})

const Token = mongoose.model('Token', TokeSchema)

export default Token