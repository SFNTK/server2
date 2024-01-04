const mongoose = require("mongoose")
const sellerschema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }, email: {
        type: String,
        required: true,
        unique: true

    }, password: {
        type: String,
        required: true
    },verified:{
        type:Boolean,
        default:false
    },photoProfil: {
        type: String,
        default:"../assets/profilePicture/user(2).png"

       
    }

},{ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

const sellermodel=mongoose.model("seller",sellerschema)
module.exports=sellermodel