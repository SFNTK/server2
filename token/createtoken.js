const jwt=require("jsonwebtoken")

const createtoken=async(id,email,password)=>{
    const refreshtoken=await jwt.sign({id:id,email:email,password:password},process.env.SECRET,{ expiresIn: "15m" })
    return refreshtoken
}

module.exports = createtoken