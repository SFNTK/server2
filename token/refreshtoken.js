const jwt=require("jsonwebtoken")
const refreshtkk=require("../models/refreshtoken")
const createtokn=require("../token/createtoken")
const refreshtkn=async(req,res)=>{
   try{ const tkn=req.body.refresh
    const tokn=await refreshtkk.findOne({token:tkn})
    if(!tokn){
        return res.status(400).json({message:"there is no token"})
    }
    await jwt.verify(tkn,process.env.SECRET,async(err,dt)=>{
        if(err){
            return res.status(400).json({message:err.message})
        }else{
     const new_token= await  createtokn(dt.id,dt.email,dt.password)
     return res.status(200).json({message:"all is good",token:new_token})
        }
    })}catch(error){
        return res.status(400).json({message:error.message})
    }
}


module.exports = refreshtkn
