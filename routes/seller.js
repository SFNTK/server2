const express = require('express');
const router = express.Router();
const sellermodel = require("../models/seller")
const multer = require("multer");
const verifmodel = require("../models/verif")
const sendemail=require("../emails/verification")
const refreshmodel=require("../models/refreshtoken")
const createtoken=require("../token/createtoken")
const verify=require("../token/verify")

const refreshtkn=require("../token/refreshtoken")

imagettl = ''
errorImage = false

const first = multer.diskStorage({
    destination: "./assets/profilesPictures",
    filename: (req, file, callback) => {
        let nameofpicture = `${req.body.username}-${Date.now()}.${file.mimetype.split("/")[1]}`;
        imagettl = nameofpicture
        callback(null, nameofpicture)

    }
})

const check = multer({
    storage: first,
    fileFilter: (req, file, cb) => {
        const typesvalidated = ["jpg", "png", "jpeg"]
        if (typesvalidated.includes(file.mimetype.split("/")[1])) {
            cb(null, true)
        } else {
            errorImage = true
            cb(null, false)
        }

    }
})

const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken");



router.post("/createaccount", check.any('images'), async (req, res) => {
    if (errorImage == true) {
        errorImage = false
        return res.status(400).json({ message: "error in your profile image" })
    }
    if (imagettl == "") {
        imagettl = process.env.DEFAULTIMAGE
    }
    const hashedpass = await bcrypt.hashSync(req.body.password, 10)
    const data = {
        "username": req.body.username,
        "email": req.body.email,
        "password": hashedpass,
        "photoProfil": imagettl
    }
    try {
        const seller = await sellermodel(data)
        await seller.save()
        const codeverif = Math.floor(1000 + Math.random() * 9000)

        const veriftoken = await jwt.sign({ "code": codeverif }, process.env.SECRET, { expiresIn: "15m" })
        const verif = await verifmodel({ id_seller: seller._id, token: veriftoken, code: codeverif })
        await verif.save()
        const response = await sendemail(data.email, codeverif)
        return res.status(200).json({"message":"all is good",response:response,"id":seller._id})

    } catch (err) {
        return res.status(400).json({ "message": err.message, "mdd": err })

    }

})

router.post('/verif/:id',async(req,res)=>{
    const id=req.params.id
    const code=req.body.code
    const verification= await verifmodel.findOne({id_seller:id})
    if(!verification){
        return res.status(400).json({"message":"unfound user"})
    }else{
        const token=verification.token
        await jwt.verify(token,process.env.SECRET,(err,user)=>{
            if(err){
                return res.status(400).json({"message1":err.message})
            }
        });
        if(verification.code==code){
            const seller=await sellermodel.findById(id)
            if(seller.verified==true){
                return res.status(400).json({"message":"your account is already verified"})
            }else{
                seller.verified=true
                await seller.save()
            }
            await verifmodel.findByIdAndDelete(verification._id)
            const accestoken=await createtoken(seller._id,seller.email,seller.password)
            const refreshtoken=await jwt.sign({id:id,email:seller.email,password:seller.password},process.env.SECRET)
            const refreshtable=await new refreshmodel({"id_seller":seller._id,"token":refreshtoken})
            await refreshtable.save()
            return res.status(200).json({"message":"all is good",token:accestoken})
        }
    }
})

router.post('/refresh',refreshtkn)

router.post("/login",async(req,res)=>{
   try{
    const email=req.body.email
    const password=req.body.password
    const seller=await sellermodel.findOne({email:email})
    if(!seller){
        return res.status(400).json({
            message:"email or password incorrect"
        })
    }else{
        const result=await bcrypt.compareSync(password,seller.password)
        if(result){
            const token=await createtoken(seller._id,seller.email,seller.password)
            const refreshtokken=await jwt.sign({id:seller._id,email:seller.email,password:seller.password},process.env.SECRET)
            const refreshtbla=await refreshmodel({id_seller:seller._id,token:refreshtokken})
            await refreshtbla.save()
            return res.status(200).json({token:token,refresh:refreshtokken})
        }
    }
}catch(err){
    return res.status(400).json({message:err.message})
}
})
router.post('/test',verify,async(req,res)=>{
return res.send("test passed")
})

module.exports = router