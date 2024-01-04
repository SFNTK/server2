const jwt = require("jsonwebtoken")
const verify = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    if (!token) {
        return res.status(400).json({ message: "create an account to get the access to this page " })
    } else {
        await jwt.verify(token, process.env.SECRET, (err, dt) => {
            if (err) {
                return res.status(401).json({ message: err.message })

            } else {
                next()
            }
        })
    }


}


module.exports = verify