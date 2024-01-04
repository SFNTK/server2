const mongoose=require("mongoose")
const refreshschema=new mongoose.Schema({
    id_seller:{
        type:mongoose.Types.ObjectId,
        ref:'seller',
        required:true
    },
    token:{
        type:String,
        required:true
    }
})

const verifmodel=mongoose.model("TOKENrefresh",refreshschema)

module.exports = verifmodel