import nodemailer from "nodemailer";

const sendEmail = async (to, subject, mailBody) => {
  try {
    console.log(to, subject, mailBody);

    const bullet = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSCODE,
      },
    });

    console.log("bullet Trayr Ho gya");

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: mailBody,
    };
    console.log("Saman load Ho gya");

    const result = await bullet.sendMail(mailOptions);
    console.log("Email Sent Successfully", result.messageId);
    return true;
  } catch (error) {
    console.error("Error sending Email", error);
    return false;
  }
};

export default sendEmail;
