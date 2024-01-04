const { json } = require('body-parser');
const express = require('express');
const router = express.Router();

const jerseymodel = require("../models/jersey")

const fs = require('fs');
const verific = require("../token/verify")
const path = require('path');

imagettl = []

errorImage = false;
const multer = require('multer');

const first = multer.diskStorage({
    destination: "./assets/jerseysimages",
    filename: (req, file, callback) => {
        // let nameofpicture = `${req.body.username}-${Date.now()}.${file.mimetype.split("/")[1]}`;


        let nameofpicture = `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}.${file.mimetype.split("/")[1]}`;
        imagettl.push(nameofpicture)
        callback(null, nameofpicture)

    }
})

const check = multer({
    storage: first,
    fileFilter: (req, file, cb) => {
        const typesvalidated = ["jpg", "png", "jpeg", "webm", "webp"]
        if (typesvalidated.includes(file.mimetype.split("/")[1])) {
            cb(null, true)
        } else {
            errorImage = true
            cb(null, false)
        }

    }
})

const pricesetter = async (req, res, next) => {

    try {
        const prcs = JSON.parse(req.body.prices)

        req.body.finalprices = prcs
        next()
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ message: error.message })
    }
}

router.post("/addjersey", check.array("images", 10), pricesetter, async (req, res) => {
    if (errorImage == true) {
        errorImage = false
        return res.json({ "message": "type error" })
    }
    if (imagettl.length == 0) {
        return res.json({ message: "upload at least one image " })


    }
    try {
        const name = req.body.name
        const description = req.body.description
        const images = imagettl
        const categorie = req.body.categorie
        const finalprices = req.body.finalprices
        const rating = req.body.rating
        const jerseytbl = await jerseymodel({ name: name, description: description, images: images, categorie: categorie, prices: finalprices, rating: rating })
        await jerseytbl.save()
        imagettl = []
        return res.status(200).json({ "message": "all is good" })
    } catch (err) {
        let path1;
        for (let i = 0; i < imagettl.length; i++) {
            path1 = path.join(__dirname, `../assets/jerseysimages/${imagettl[i]}`)
            try {
                fs.unlinkSync(path1)
            } catch (err2) {
                imagettl = []
                return res.json({ message: err2.message + " hna" })
            }
        }
        imagettl = []


        return res.json({ "message": err.message + " hna2" })
    }


})

router.put('/updateimages/:id', check.array("images", 10), async (req, res) => {
    try {
       
        const jersey = await jerseymodel.findById(req.params.id)

        let oldmain = jersey.images[0]
        console.log(req.body.deleted.split(","))
        if (imagettl.length == 0) {
            console.log("0 azbi")
        }

        let deleted = req.body.deleted.split(",")

        if (imagettl.length > 0) {

            

            if (parseInt(req.body.mainedded) == 0) {
                for (let i = 0; i < imagettl.length; i++) {
                    console.log('h')
                    jersey.images.push(imagettl[i])
                    console.log("hna 1")

                }


            } else {
                jersey.images[0] = imagettl[0]
                for (let i = 1; i < imagettl.length; i++) {
                    console.log("h2")
                    jersey.images.push(imagettl[i])

                }


            }
        }
        let path1;
        if (req.body.deleted) {

            console.log('jk')
            for (let i = 0; i < deleted.length; i++) {
                path1 = path.join(__dirname, `../assets/jerseysimages/${deleted[i]}`)
                try {
                    fs.unlinkSync(path1)

                } catch (errr) {
                    let path2;
                    if (parseInt(req.body.mainedded) == 1) {
                        jersey.images[0] = oldmain

                        for (let i = 1; i < imagettl.length; i++) {
                            path2 = path.join(__dirname, `../assets/jerseysimages/${imagettl[i]}`)
                            try {
                                fs.unlinkSync(path2)
                            } catch (errr) {
                                imagettl = []
                                console.log("here 2 " + errr.message)
                                return res.status(400).json({ "message delete after error": errr.message })
                            }
                        }
                        imagettl = []



                    }
                    else {
                        for (let i = 0; i < imagettl.length; i++) {
                            path2 = path.join(__dirname, `../assets/jerseysimages/${imagettl[i]}`)
                            try {
                                fs.unlinkSync(path2)
                            } catch (errr) {
                                imagettl = []
                                return res.status(400).json({ "message delete after error": errr.message })
                            }
                        }
                        imagettl = []

                    }

                    imagettl = []
                    console.log("here 3 " + errr.message)
                    return res.status(400).json({ "message of deleting ": errr.message })
                }
            }

            for (let i = 0; i < deleted.length; i++) {
                for (j = 0; j < jersey.images.length; j++) {
                    if (jersey.images[j] == deleted[i]) {
                        jersey.images.splice(j, 1)

                        j = jersey.images.length
                        i = i - 1
                    }
                }

            }
            deleted = []

        }
        if (parseInt(req.body.mainedded) == 1) {
            path1 = path.join(__dirname, `../assets/jerseysimages/${oldmain}`)
            try {
                fs.unlinkSync(path1)

            } catch (errr) {
                jersey.images[0]=oldmain

            }

        }

        imagettl = []

        await jersey.save()
        return res.status(200).json({ message: "perfecto" })


    } catch (err) {
        console.log("here 4 " + err.message)
        return res.status(400).json({ message: err.message })


    }

})

router.get('/alljerseys', verific, async (req, res) => {
    try {
        const jerseys = await jerseymodel.find().select("name")
        return res.status(200).json({ data: jerseys })
    } catch (err) {
        return res.status(400).json({ message: err.message })

    }
})
router.put('/updatejersey/:id', pricesetter, async (req, res) => {

    try {


        const name = req.body.name
        const description = req.body.description
        // const images = imagettl
        const categorie = req.body.categorie
        const finalprices = req.body.finalprices
        const rating = parseInt(req.body.rating)
        let jersey22 = await jerseymodel.findById(req.params.id)
        //let deletedimages = jersey22.images
        jersey22.name = name
        jersey22.description = description
        //        jersey22.images = images
        jersey22.categorie = categorie
        jersey22.prices = finalprices
        await jersey22.save()

        const jersey23 = await jerseymodel.findByIdAndUpdate(req.params.id, {
            $set: {
                "rating": parseInt(rating)
            }
        }, { new: true })
        /*let path1;
        for (let i = 0; i < deletedimages.length; i++) {
            path1 = path.join(__dirname, `../assets/jerseysimages/${deletedimages[i]}`)
            try {
                fs.unlinkSync(path1)

            } catch (errr) {
                imagettl = []
                return res.status(400).json({ "message of deleting ": errr.message })
            }
        }
        deletedimages = []
        imagettl = []*/
        return res.status(200).json({ "message": "jersey updated successfully" })
    } catch (err) {
        /* let path1;
         for (let i = 0; i < imagettl.length; i++) {
             path1 = path.join(__dirname, `../assets/jerseysimages/${imagettl[i]}`)
             try {
                 fs.unlinkSync(path1)
             } catch (errr) {
                 imagettl = []
                 return res.status(400).json({ "message delete after error": errr.message })
             }
         }
         imagettl = []*/
        console.log(err.message)
        return res.status(400).json({ "message": err.message })
    }
})

router.delete("/deletejersey/:id", async (req, res) => {
    const deleted = await jerseymodel.findByIdAndDelete(req.params.id)
    if (!deleted) {
        return res.status(400).json({ message: "there is no jersey" })
    } else {
        let path1;
        console.log(deleted)
        for (let i = 0; i < deleted.images.length; i++) {
            path1 = path.join(__dirname, `../assets/jerseysimages/${deleted.images[i]}`)
            try {
                fs.unlinkSync(path1)
            }
            catch (errr) {

                return res.status(400).json({ message: errr.message })

            }
        }
        return res.status(200).json({ message: "deleted successfuly" })
    }
})

const getjerseybykey = async (req, res, next) => {
    try {
        const jersey = req.params.jersey
        // const jerseys = await jerseymodel.find({ name: { $regex: jersey, $options: "i" } })
        const jerseys = await jerseymodel.find()

        const inputdata = jersey.split(" ")

        for (let i = 0; i < inputdata.length; i++) {
            if (inputdata[i] == "jersey" || inputdata[i] == "jerseys") {
                inputdata.splice(i, 1)
            }
        }



        if (!jerseys) {
            return res.status(400).json({ message: "there is no jersey" })
        } else {
            let namejersey;
            let finallista = []
            for (let i = 0; i < jerseys.length; i++) {
                namejersey = jerseys[i].name.split(" ")

                for (let j = 0; j < namejersey.length; j++) {
                    for (let k = 0; k < inputdata.length; k++) {
                        if (namejersey[j] == inputdata[k]) {
                            finallista.push({ "the_jersey": jerseys[i], "score": 0 })

                            k = inputdata.length
                            j = namejersey.length
                        }
                    }
                }
            }

            let jerseysname;
            for (let c = 0; c < finallista.length; c++) {
                jerseysname = finallista[c].the_jersey.name.split(" ")
                console.log(`name ${jerseysname}`)
                for (let j = 0; j < jerseysname.length; j++) {
                    for (let i = 0; i < inputdata.length; i++) {
                        if (jerseysname[j] == inputdata[i]) {
                            finallista[c].score = finallista[c].score + 1
                        }
                    }
                }
            }


            finallista.sort((a, b) => b.score - a.score);
            req.body.liste = finallista
            /*   const page = req.query.page
               const limit = req.query.limit
               const startindx = (page - 1) * limit
               const endindx = page * limit
               const resultat = finallista.slice(startindx, endindx)
   
               let pagination = []
               pagination.push({ "last": Math.ceil(parseInt(resultat.length) / parseInt(limit)) + 1 })
               if (parseInt(page)+parseInt(1)  <= pagination[0].last) {
                   pagination.push({ "next": parseInt(page) + 1, limit: limit })
               }
               if (startindx > 0) {
                   pagination.push({ "previous": parseInt(page) - 1, limit: limit })
               }
   
   //req.body.liste=resultat
   req.body.liste=finallista
   req.body.pagination=pagination*/
            // return res.status(200).json({ message: "daz ", liste: resultat ,pagination})
            next()

        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

router.get("/getjerseybykey/:jersey", getjerseybykey, async (req, res) => {
    try {
        const page = req.query.page
        const limit = req.query.limit
        const startindx = (page - 1) * limit
        const endindx = page * limit
        const resultat = req.body.liste.slice(startindx, endindx)

        let pagination = []
        console.log(req.body.liste.length)
        pagination.push({ "last": Math.ceil(parseInt(req.body.liste.length) / parseInt(limit)) })
        if (parseInt(page) + parseInt(1) <= pagination[0].last) {
            pagination.push({ "next": parseInt(page) + 1, limit: limit })
        }
        if (startindx > 0) {
            pagination.push({ "previous": parseInt(page) - 1, limit: limit })
        }

        return res.status(200).json({ "message": "perfecto", liste: resultat, pagination: pagination })
    }
    catch (err) {
        return res.status(400).json({ message: err.message })
    }
})
/*router.get("/jerseysbykey/:jersey", async (req, res) => {
    try {

        const jersey = req.params.jersey
        // const jerseys = await jerseymodel.find({ name: { $regex: jersey, $options: "i" } })
        const jerseys = await jerseymodel.find()

        const inputdata = jersey.split(" ")

        for (let i = 0; i < inputdata.length; i++) {
            if (inputdata[i] == "jersey" || inputdata[i] == "jerseys") {
                inputdata.splice(i, 1)
            }
        }



        if (!jerseys) {
            return res.status(400).json({ message: "there is no jersey" })
        } else {
            let namejersey;
            let finallista = []
            for (let i = 0; i < jerseys.length; i++) {
                namejersey = jerseys[i].name.split(" ")

                for (let j = 0; j < namejersey.length; j++) {
                    for (let k = 0; k < inputdata.length; k++) {
                        if (namejersey[j] == inputdata[k]) {
                            finallista.push({ "the_jersey": jerseys[i], "score": 0 })

                            k = inputdata.length
                            j = namejersey.length
                        }
                    }
                }
            }

            let jerseysname;
            for (let c = 0; c < finallista.length; c++) {
                jerseysname = finallista[c].the_jersey.name.split(" ")
                console.log(`name ${jerseysname}`)
                for (let j = 0; j < jerseysname.length; j++) {
                    for (let i = 0; i < inputdata.length; i++) {
                        if (jerseysname[j] == inputdata[i]) {
                            finallista[c].score = finallista[c].score + 1
                        }
                    }
                }
            }


            finallista.sort((a, b) => b.score - a.score);

            const page = req.query.page
            const limit = req.query.limit
            const startindx = (page - 1) * limit
            const endindx = page * limit
            const resultat = finallista.slice(startindx, endindx)

            let pagination = []
            pagination.push({ "last": Math.ceil(parseInt(resultat.length) / parseInt(limit)) + 1 })
            if (parseInt(page)+parseInt(1)  <= pagination[0].last) {
                pagination.push({ "next": parseInt(page) + 1, limit: limit })
            }
            if (startindx > 0) {
                pagination.push({ "previous": parseInt(page) - 1, limit: limit })
            }


            return res.status(200).json({ message: "daz ", liste: resultat ,pagination})


        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})*/
router.get('/getjerseybydate/:jersey/:date', getjerseybykey, async (req, res) => {
    try {
        const days = req.params.date
        let finallista = req.body.liste
        let finalliste = []
        const dates = ["0", "1", "7", "30", "60", "90"]
        if (dates.includes(days)) {
            const current_date = new Date()
            const desired_date = new Date(current_date)
            desired_date.setDate(current_date.getDate() - days)
            console.log(desired_date)
            let jersey_date;
            for (let i = 0; i < finallista.length; i++) {
                jersey_date = new Date(finallista[i].the_jersey.createdAt)
                console.log(`jerseys's name ${finallista[i].the_jersey.name} it's date ${jersey_date.toLocaleDateString()} desired date ${desired_date.toLocaleDateString()}`)
                if (jersey_date >= desired_date) {
                    finalliste.push(finallista[i].the_jersey)


                }

            }
            const page = req.query.page
            const limit = req.query.limit
            const startindx = (page - 1) * limit
            const endindx = page * limit
            const resultat = finalliste.slice(startindx, endindx)
            console.log(endindx)
            let pagination = []

            pagination.push({ "last": Math.ceil(parseInt(req.body.liste.length) / parseInt(limit)) })
            console.log(pagination[0].last)
            if (parseInt(page) + parseInt(1) <= pagination[0].last) {
                pagination.push({ "next": parseInt(page) + 1, limit: limit })
            }
            if (startindx > 0) {
                pagination.push({ "previous": parseInt(page) - 1, limit: limit })
            }

            return res.status(200).json({ message: "perfecto", liste: resultat, pagination: pagination })
        } else {
            return res.status(400).json({ message: "enter a valid date" })
        }


    }
    catch (err) {
        return res.status(400).json({ message: err.message })

    }
})

router.get("/getjerseysbyrating/:jersey/:rating", getjerseybykey, async (req, res) => {
    try {
        const liste = req.body.liste

        let finalresult = []
        for (let i = 0; i < liste.length; i++) {
            if (liste[i].the_jersey.rating >= req.params.rating) {
                finalresult.push(liste[i].the_jersey)

            }
        }
        const page = req.query.page
        const limit = req.query.limit
        const startindx = (page - 1) * limit
        const endindx = page * limit
        const resultat = finalresult.slice(startindx, endindx)
        console.log(endindx)
        let pagination = []

        pagination.push({ "last": Math.ceil(parseInt(finalresult.length) / parseInt(limit)) })
        console.log(pagination[0].last)
        if (parseInt(page) + parseInt(1) <= pagination[0].last) {
            pagination.push({ "next": parseInt(page) + 1, limit: limit })
        }
        if (startindx > 0) {
            pagination.push({ "previous": parseInt(page) - 1, limit: limit })
        }


        return res.status(200).json({ message: 'perfecto', liste: resultat, pagination: pagination })

    }
    catch (err) {
        return res.status(400).json({ message: err.message })

    }
})

router.get("/getjerseysbyprice/:jersey/:filter", getjerseybykey, async (req, res) => {
    try {
        let liste = req.body.liste

        if (req.params.filter == "htl") {
            liste.sort((a, b) => b.the_jersey.prices[0].price - a.the_jersey.prices[0].price)
        } else if (req.params.filter == "lth") {
            liste.sort((a, b) => a.the_jersey.prices[0].price - b.the_jersey.prices[0].price)
        } else if (req.params.filter == "overaverage") {
            let prices = 0
            for (let i = 0; i < liste.length; i++) {
                prices = prices + liste[i].the_jersey.prices[0].price
            }
            let average = parseInt(prices) / parseInt(liste.length)
            let final = []
            for (let i = 0; i < liste.length; i++) {
                if (liste[i].the_jersey.prices[0].price >= average) {
                    final.push(liste[i])
                }
            }
            liste = final


        } else if (req.params.filter == "loweraverage") {
            let prices = 0
            for (let i = 0; i < liste.length; i++) {
                prices = prices + liste[i].the_jersey.prices[0].price
            }
            let average = parseInt(prices) / parseInt(liste.length)
            let final = []
            for (let i = 0; i < liste.length; i++) {
                if (liste[i].the_jersey.prices[0].price <= average) {
                    final.push(liste[i])
                }
            }
            liste = final
        }
        const page = req.query.page
        const limit = req.query.limit
        const startindx = (page - 1) * limit
        const endindx = page * limit
        const resultat = liste.slice(startindx, endindx)
        console.log(endindx)
        let pagination = []

        pagination.push({ "last": Math.ceil(parseInt(liste.length) / parseInt(limit)) })
        console.log(pagination[0].last)
        if (parseInt(page) + parseInt(1) <= pagination[0].last) {
            pagination.push({ "next": parseInt(page) + 1, limit: limit })
        }
        if (startindx > 0) {
            pagination.push({ "previous": parseInt(page) - 1, limit: limit })
        }

        return res.status(200).json({ pagination: pagination, liste: liste })

    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err })
    }
})

router.get("/getlatestjerseys", async (req, res) => {

    try {
        const jerseys = await jerseymodel.find().sort({ createdAt: 1 }).limit(7)
        if (!jerseys) {
            return res.status(400).json({ message: "there is no jersey trendy for now" })
        } else {
            return res.status(200).json({ data: jerseys })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})


router.get('/onejersey/:id', async (req, res) => {
    try {
        const id = req.params.id
        const data = await jerseymodel.findById(id)
        if (!data) {
            return res.status(500).json({ message: "there is no data" })
        } else {
            return res.status(200).json({ data: data })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})



module.exports = router