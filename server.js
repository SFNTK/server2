const express=require("express")
const app=express()
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const cors = require('cors');


app.use(cors())
app.listen(3001)
const path=require("path")
app.use("/assets",express.static(path.join(__dirname,"assets")))

require("./connection/connection")

const routeseller=require("./routes/seller")
app.use('/seller',routeseller)


const routerjersey=require("./routes/jersey")
app.use('/jersey',routerjersey)

const routercommande=require("./routes/commande")
app.use('/commande',routercommande)
