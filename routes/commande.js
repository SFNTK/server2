const { json } = require('body-parser');
const express = require('express');
const router = express.Router();

const verific = require("../token/verify")

const commandemodel = require("../models/commande")

const jerseymodel = require("../models/jersey")




const checkquantity = async (req, res, next) => {
    try {
        const jerseytable = await jerseymodel.findOne({ _id: req.params.id_jersey }).select("prices")
        const commandequantity = req.body.quantity
        const commandetaille = req.body.taille
        for (let i = 0; i < jerseytable.prices.length; i++) {
            if (jerseytable.prices[i].taille == commandetaille) {
                if (jerseytable.prices[i].quantity >= commandequantity) {
                    req.body.finalprice = jerseytable.prices[i].price * commandequantity
                    next()
                } else {
                    return res.status(400).json({ message: "your choosen quantity is out of stock" })
                }
            }
        }

    } catch (error) {
        return res.send(error.message)
    }
}
router.get('/allcommandes',verific,async(req,res)=>{
   try{
    const commandes=await commandemodel.find().populate("id_jersey")
    return res.status(200).json({data:commandes})
   }catch(er){
    return res.status(300).json({message:er.message})

   }
    
})
router.post('/addcommande/:id_jersey', checkquantity, async (req, res) => {
    try {
        const quantity1 = req.body.quantity
        const taille = req.body.taille
        const firstname = req.body.firstname
        const lastname = req.body.lastname
        const phone = req.body.phonenumber
        const email = req.body.email
        const price = req.body.finalprice
        const id_jersey = req.params.id_jersey
        const commandetable = await commandemodel({
            id_jersey: id_jersey,
            quantity: quantity1,
            taille: taille,
            price: price,
            firstname: firstname,
            lastname: lastname,
            email: email,
            phonenumber: phone,
            verified: false
        })
        await commandetable.save()
        const jerseytable = await jerseymodel.findById(id_jersey)
        for (let i = 0; i < jerseytable.prices.length; i++) {
            if (jerseytable.prices[i].taille == taille) {
                jerseytable.prices[i].quantity = jerseytable.prices[i].quantity - quantity1
            }
        }

        await jerseytable.save()
        const jerseytable2 = await jerseymodel.findByIdAndUpdate(id_jersey, {
            $set: {
                numberofsells: parseInt(jerseytable.numberofsells) + parseInt(quantity1)
            }
        }, { new: true })

        return res.status(200).json({ message: "commande added successfuly" })





    } catch (err) {
        return res.json({ message: err.message })
    }




})

router.get("/getverified", verific, async (req, res) => {
    try {


        const verified = await commandemodel.find({ verified: true })

        const page = req.query.page
        const limit = req.query.limit
        const startindx = (page - 1) * limit
        const endindx = page * limit
        const resultat = verified.slice(startindx, endindx)
        console.log(endindx)
        let pagination = []

        pagination.push({ "last": Math.ceil(parseInt(verified.length) / parseInt(limit)) })

        if (parseInt(page) + parseInt(1) <= pagination[0].last) {
            pagination.push({ "next": parseInt(page) + 1, limit: limit })
        }
        if (startindx > 0) {
            pagination.push({ "previous": parseInt(page) - 1, limit: limit })
        }

        if (!verified) {
            return res.status(400).json({ message: "there is no verified commande" })

        } else {
            return res.status(200).json({ data: verified, pagination: pagination, number: verified.length })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

router.get("/getnoverified", verific, async (req, res) => {
    try {


        const verified = await commandemodel.find({ verified: false })

        const page = req.query.page
        const limit = req.query.limit
        const startindx = (page - 1) * limit
        const endindx = page * limit
        const resultat = verified.slice(startindx, endindx)
        console.log(endindx)
        let pagination = []

        pagination.push({ "last": Math.ceil(parseInt(verified.length) / parseInt(limit)) })

        if (parseInt(page) + parseInt(1) <= pagination[0].last) {
            pagination.push({ "next": parseInt(page) + 1, limit: limit })
        }
        if (startindx > 0) {
            pagination.push({ "previous": parseInt(page) - 1, limit: limit })
        }

        if (!verified) {
            return res.status(400).json({ message: "there is no unverified commande" })

        } else {
            return res.status(200).json({ data: verified, pagination: pagination, number: verified.length })
        }
    } catch (err) {

        return res.status(400).json({ message: err.message })

    }

})

router.get('/getverifiednumber', verific, async (req, res) => {
    try {
        const noverified = await commandemodel.find({ verified: false })
        const verified = await commandemodel.find({ verified: true })
        let noverifnumber = noverified.length
        let verifnumber = verified.length

        return res.status(200).json({ verified: verifnumber, noverified: noverifnumber })


    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

router.get("/totalcommandes", verific, async (req, res) => {
    try {
        const commandes = await commandemodel.find()
        if (!commandes) {
            return res.status(400).json({ message: "there is no commande" })
        }
        const page = req.query.page
        const limit = req.query.limit
        const startindx = (page - 1) * limit
        const endindx = page * limit
        const resultat = commandes.slice(startindx, endindx)
        console.log(endindx)
        let pagination = []

        pagination.push({ "last": Math.ceil(parseInt(commandes.length) / parseInt(limit)) })

        if (parseInt(page) + parseInt(1) <= pagination[0].last) {
            pagination.push({ "next": parseInt(page) + 1, limit: limit })
        }
        if (startindx > 0) {
            pagination.push({ "previous": parseInt(page) - 1, limit: limit })
        }
        return res.status(200).json({ pagination: pagination, data: resultat, number: commandes.length })


    } catch (err) {
        return res.status(400).json({ message: err.message })
    }

})

router.get("/fullcommandenumber", verific, async (req, res) => {
    try {
        const commande = await commandemodel.find()
        let number = 0
        if (!commande) {
            number = 0
        } else {
            number = commande.length
        }
        return res.status(200).json({ data: number })
    }
    catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

router.get("/jerseyssoldnumber", verific, async (req, res) => {
    try {
        const jerseys = await jerseymodel.find()
        const commandes = await commandemodel.find()
        let num = 0;
        let finalresult = []
        for (let i = 0; i < jerseys.length; i++) {
            num=0
            for (let j = 0; j < commandes.length; j++) {
                if (jerseys[i].id == commandes[j].id_jersey) {
                    num = num + 1
                }
            }
            finalresult.push({ "jersey": jerseys[i], "number": num })

        }


        const page = req.query.page
        const limit = req.query.limit
        const startindx = (page - 1) * limit
        const endindx = page * limit
        const resultat = finalresult.slice(startindx, endindx)

        let pagination = []
      //  console.log(req.body.liste.length)
        pagination.push({ "last": Math.ceil(parseInt(finalresult.length) / parseInt(limit)) })
        if (parseInt(page) + parseInt(1) <= pagination[0].last) {
            pagination.push({ "next": parseInt(page) + 1, limit: limit })
        }
        if (startindx > 0) {
            pagination.push({ "previous": parseInt(page) - 1, limit: limit })
        }



        return res.status(200).json({ data: resultat ,pagination:pagination})
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})


router.get("/numberbymonths/:year", verific, async (req, res) => {
    try {
        const entredyear = req.params.year
        console.log("cool")
        const commandes = await commandemodel.find()
        const date = new Date()
        const year = date.getFullYear()
        let months = []
        const strin = "2023-12-13T20:17:57.063+00:00"
        const dd = new Date(strin)
        console.log(dd.getMonth() + 1)
        if (entredyear == year) {
            for (let j = 1; j <= date.getMonth() + 1; j++) {
                months.push({ "month": j, "number_of_sells": 0 })

            }
            for (let i = 0; i < commandes.length; i++) {
                if (commandes[i].createdAt.getFullYear() == year) {
                    months[commandes[i].createdAt.getMonth()].number_of_sells = months[commandes[i].createdAt.getMonth()].number_of_sells + 1

                }
            }
        } else {
            for (let j = 1; j <= 12; j++) {
                months.push({ "month": j, "number_of_sells": 0 })
            }
            for (let i = 0; i < commandes.length; i++) {
                if (commandes[i].createdAt.getFullYear() == entredyear) {
                    months[commandes[i].createdAt.getMonth()].number_of_sells = months[commandes[i].createdAt.getMonth()].number_of_sells + 1

                }
            }

        }



        return res.status(200).json({ data: months })
    }
    catch (err) {
        return res.status(400).json({ message: err.message })

    }

})

router.get("/moneyearned", verific, async (req, res) => {
    try {
        const commandes = await commandemodel.find()
        let totalmoney = 0
        for (let i = 0; i < commandes.length; i++) {
            totalmoney = totalmoney + commandes[i].price
        }
        return res.status(200).json({ data: totalmoney })

    } catch (err) {
        return res.status(400).json({ message: err.message })
    }

})

router.get('/trendy', async (req, res) => {
    try {
        // const commandes_id=await commandemodel.find().sort("-createdAt").limit(5).select("id_jersey")
        const commandes_id = await commandemodel.aggregate([
            { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
            { $group: { _id: '$id_jersey' } }, // Group by id_jersey to get distinct values
            { $limit: 5 }, // Limit the number of results to 5
            { $project: { _id: 0, id_jersey: '$_id' } } // Project to shape the output
        ]);
        let cmdids = []
        for (let i = 0; i < commandes_id.length; i++) {
            cmdids.push(commandes_id[i].id_jersey)
        }
        const commandes = await jerseymodel.find({ _id: { $in: cmdids } })
        if (commandes.length == 5) {
            return res.status(200).json({ data: commandes })

        } else {
            let trendyl = commandes.length
            let ids = []
            for (let j = 0; j < commandes.length; j++) {
                ids.push(commandes[j]._id)
            }
            const jerseys = await jerseymodel.find({ _id: { $nin: ids } }).sort('-createdAt').limit(5 - parseInt(trendyl))
            for (let i = 0; i < jerseys.length; i++) {
                commandes.push(jerseys[i])
            }
            return res.status(200).json({ data: commandes })

        }
    } catch (err) {
        return res.status(400).json({ message: err.message })

    }
})

router.post("/verify/:id", async (req, res) => {
    try {
        const id = req.params.id
        const commande = await commandemodel.findById(id)
        if (commande.verified == false) {
            await commandemodel.findByIdAndUpdate(id, { $set: { verified: true } })
            return res.status(200).json({ message: "your commande is verified successfuly" })

        }
        else {
            return res.status(400).json({ message: "your commande is laready verified" })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})
/*
router.get('/test', async (req, res) => {
    const lista=[
        {"jersey":"milan","date":"2023-12-12T22:32:53.268+00:00"},
    {"jersey":"manchester city","date":"2023-09-28T22:32:53.268+00:00"},
    {"jersey":"real madrid","date":"2023-12-01T22:32:53.268+00:00"},
    {"jersey":"barcelona","date":"2022-04-02T22:32:53.268+00:00"},
    {"jersey":"inter milan","date":"2023-12-01T22:32:53.268+00:00"}
]
    const datee = new Date("2023-12-12T22:32:53.268+00:00")
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = datee.toLocaleDateString('en-GB', options);
    const startDate = new Date('2023-01-01'); // Replace with your desired start date
const endDate = new Date('2023-01-10'); // Replace with your desired end date
const currentdate=new Date()
const ts3in=new Date(currentdate)
ts3in.setDate(currentdate.getDate()-90)
return res.json(ts3in.toLocaleDateString())
// Loop through dates
for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    
  console.log(date.toDateString());
  // Perform operations with each date here
}
    return res.json(formattedDate)
})*/
module.exports = router