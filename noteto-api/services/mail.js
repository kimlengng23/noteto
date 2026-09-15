const mail = require("../js/mail.js");

function sendAccountVerifyEmail(sessionInfo) {
  let promise = new Promise((resolve, reject) => {
    const mailData = {
      from: process.env.MAIL_FROM || "Noteto <no-reply@example.com>", // sender address
      to: sessionInfo["email"], // list of receivers
      subject: "No Reply: Verify Your Email",
      html: `
      <p>Hello ${sessionInfo["first"]} ${sessionInfo["last"]},</br></br>
  
      Thank you for registering an account with Noteto.</br>
      To finish registering and continue exploring, please verify your email using the button below.</br></br>
  
      <a href="${process.env.DOMAIN}/#/verify/email/${sessionInfo["sessionId"]}" target="_blank">Verify Email</a></br></br>
  
      Sincerely,</br></br>
  
      -Noteto Team
  
      </p>`,
    };

    mail.transporter.sendMail(mailData, function (err, info) {
      if (err) {
        console.log("MailService - sendAccountVerifyEmail", err);
        reject({ code: 500, message: err });
      } else {
        console.log(info);
        resolve({ code: 200 });
      }
    });
  });
  return promise;
}
module.exports = {
  sendAccountVerifyEmail,
};
