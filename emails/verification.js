const nodemailer = require("nodemailer")

const sendemail = (email, code) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });




        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "confirmation of your account",
            text: ` your confirmation code  is <br/> ${code} 
        `,
        };


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
               reject(error)
            } else {
               resolve(info.response)
            }
        });
    });

}
module.exports = sendemail