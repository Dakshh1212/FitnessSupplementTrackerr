const nodemailer = require("nodemailer");

console.log("sendEmail.js loaded ✅");

const sendWelcomeEmail = async (email, name) => {

  console.log("Trying to send email to:", email);

  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fitnesstrackerrrr@gmail.com",
        pass: "wqukmuogmttdrzrk"
      }
    });

    // ✅ CHECK CONNECTION
    await transporter.verify();

    console.log("Mail server ready ✅");

    const mailOptions = {
      from: "fitnesstrackerrrr@gmail.com",
      to: email,
      subject: "Welcome to Fitness Tracker 💪",
      html: `
        <h2>Hello ${name}</h2>
        <p>Welcome to Fitness Tracker 🚀</p>
        <p>Your account has been created successfully.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent ✅");

  } catch (err) {

    console.log("MAIL ERROR ❌");
    console.log(err);
  }
};

module.exports = sendWelcomeEmail;