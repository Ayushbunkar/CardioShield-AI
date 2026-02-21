import Contact from "../models/contactModel.js";

export const ContactUs = async (req, res, next) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !subject || !message || !phone) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }

    const newContact = await Contact.create({
      name,
      email,
      subject,
      message,
      phone,
      status: "Pending",
    });

    res.status(201).json({
      message: `Thanks for Contacting Us. You will receive a Response soon at ${newContact.email}`,
    });
  } catch (error) {
    next(error);
  }
};
