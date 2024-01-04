const mongoose = require("mongoose")
const jerseyschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, description: {
        type: String,
        required: true
    }, images: {
        type: [String],
        minlength: 1,
        required: true
    }, prices: {
        type: [{
            "taille": String
            , "price": Number
            , "quantity": {
                type: Number,
                min: 1,

            }
        }],
        required: true,

    },categorie:{
        type:String,
        enum:["national team","team","other"],
        required:true
    },numberofsells:{
        type:Number,
        default:0
    },rating:{
        type:Number,
        default:0
    }


},{ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

const jerseymodel=mongoose.model("jerseystable",jerseyschema)
module.exports=jerseymodel