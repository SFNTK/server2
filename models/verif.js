const mongoose=require("mongoose")
const verifschema=new mongoose.Schema({
    id_seller:{
        type:mongoose.Types.ObjectId,
        ref:'seller',
        required:true
    },
    token:{
        type:String,
        required:true
    },code:{
        type:String,
        required:true
    }
})

const verifmodel=mongoose.model("verifseller",verifschema)

module.exports = verifmodel