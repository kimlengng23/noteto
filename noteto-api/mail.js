const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
port: 465,               // true for 465, false for other ports
host: "smtp.gmail.com",
   auth: {
        user: 'kteexpressmail@gmail.com',
        pass: 'Kom.pongThom97626611@',
     },
secure: true,
});

module.exports = {
   transporter
}