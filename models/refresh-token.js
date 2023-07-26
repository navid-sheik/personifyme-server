import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    token: String,
    expires: Date
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;