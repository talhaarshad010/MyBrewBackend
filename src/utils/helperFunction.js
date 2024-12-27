const nodemailer = require("nodemailer");

const sendEmail = async (mailOptions) => {
  const Transporter = nodemailer.createTransport({
    host: "smtp.logicloopsolutions.net",
    auth: {
      user: "abdul.basit@logicloopsolutions.net",
      pass: "hKFAQ2QarjBBpLfNJBD5",
    },
    port: 465,
    secure: true,
  });

  await Transporter.sendMail(mailOptions, (error, Info) => {
    if (error) {
      console.log("Error", error.message);
    } else {
      console.log("Info", Info.response);
    }
  });
};
module.exports = { sendEmail };
