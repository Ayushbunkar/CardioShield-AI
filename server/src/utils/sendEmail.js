import nodemailer from "nodemailer";

const sendEmail = async (to, subject, mailBody, fromOverride = null) => {
  try {
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASSCODE;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const mailFrom = fromOverride || process.env.MAIL_FROM || smtpUser;

    if (!smtpUser || !smtpPass) {
      console.warn("Email not sent: SMTP credentials missing.");
      return false;
    }

    const transportConfig = smtpHost
      ? {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        }
      : {
          service: "gmail",
          auth: { user: smtpUser, pass: smtpPass },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: mailFrom,
      to,
      subject,
      html: mailBody,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email Sent Successfully", result.messageId);
    return true;
  } catch (error) {
    console.error("Error sending Email", error);
    return false;
  }
};

export default sendEmail;
