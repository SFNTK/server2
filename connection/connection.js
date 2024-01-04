require('dotenv').config();
const mongoose = require('mongoose');
module.exports=mongoose.connect(process.env.CONNECTION)
    .then(console.log('database connected succesfuly'))
    .catch(
        (err) => { console.log("erreur is " + err) }
    )
