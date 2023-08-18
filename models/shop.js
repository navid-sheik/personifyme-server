import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
    name : {
        type: String,
        unique: [true, 'Shop name already taken'],
        required: [true, 'Please provide a shop name'],

    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        default: "No description provided"
    },
    location : {
        type: String,
        default: "United States"
    },
    currecy : {
        type: String,
        default: "USD"
    },
    image : {
        type: String
    },
    isActive : {
        type : Boolean,
        default : true


    },
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please provide a category']
    },
    categoryName : {
        type : String,
        required: [true, 'Please provide a category']
    },
    emailSupport : {
      type: String,
      required: [true, 'Please provide an email']
    },



  
    follows: {
        type: Number,
        default: 0
    },
    followers : {
       type : [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    totalLikes : {
        type: Number,
        default: 0
    },
    // totalOrders : {
    //     type: Number,
    //     default: 0
    // },
    

    



  
    // other fields you might want to include...
  }, { timestamps: true , versionKey: false});
  
ShopSchema.pre('save', function(next) {
    // 'this' refers to the shop instance
    if (this.isNew) {
      const objectId = new mongoose.Types.ObjectId();
      this.name = 'Shop' + objectId.toString()
    }
    next();
  });
const Shop = mongoose.model('Shop', ShopSchema);
export default Shop;