const mongoose = require("mongoose")

const commandeschema = new mongoose.Schema({
    id_jersey: {
        type: mongoose.Types.ObjectId,
        ref: 'jerseystable',
        required: true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },price:{
        type:Number,
        required:true,
        min:0
    },taille:{
        type:String,
        required:true
    },firstname:{
        type:String,
        required:true

    },lastname:{
        type:String,
        required:true

    },phonenumber:{
        type:String,
        required:true

    },
    email:{type:String,
    required:false},verified:{
        type:Boolean
    }

},{ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

const commandemdel=mongoose.model("commandetable",commandeschema)
module.exports=commandemdel