const nodemailer = require("nodemailer");

require("dotenv").config();


const transporter = nodemailer.createTransport({

  host: "smtp.gmail.com",

  port: 587,

  secure: false,

  auth: {
    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASSWORD,
  },

  tls: {
    rejectUnauthorized: false,
  },

});



async function sendEmail({
  to,
  subject,
  html,
}) {

  try {

    await transporter.sendMail({

      from: `"StuHealth AI" <${process.env.EMAIL_USER}>`,

      to,

      subject,

      html,

    });


    console.log(
      "Email sent to:",
      to
    );


  } catch (error) {

    console.error(
      "Email error:",
      error.message
    );

    throw error;

  }

}



module.exports = sendEmail;