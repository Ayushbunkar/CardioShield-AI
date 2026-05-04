import Contact from "../models/contactModel.js";
import sendEmail from "../utils/sendEmail.js";

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

const HEALTHCARE_TYPES = {
  HIGH_RISK: ["hospital", "clinic", "doctors"],
  MEDIUM_RISK: ["hospital", "clinic", "doctors", "pharmacy"],
  LOW_RISK: [],
};

const buildOverpassQuery = (lat, lng, radius, riskLevel) => {
  const levelKey = `${String(riskLevel || "MEDIUM").toUpperCase()}_RISK`;
  const types = HEALTHCARE_TYPES[levelKey] || HEALTHCARE_TYPES.MEDIUM_RISK;

  const amenityFilters = types
    .map((type) => `node["amenity"="${type}"](around:${radius},${lat},${lng});`)
    .join("\n");
  const wayFilters = types
    .map((type) => `way["amenity"="${type}"](around:${radius},${lat},${lng});`)
    .join("\n");

  const healthcareQuery = `
    node["healthcare"](around:${radius},${lat},${lng});
    way["healthcare"](around:${radius},${lat},${lng});
  `;

  return `
    [out:json][timeout:25];
    (
      ${amenityFilters}
      ${wayFilters}
      ${healthcareQuery}
    );
    out body center;
  `;
};

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

    const receiver = process.env.MAIL_TO || process.env.CONTACT_RECEIVER || process.env.SMTP_USER || process.env.GMAIL_USER;
    const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
    if (receiver) {
      const mailSubject = `New Contact: ${subject}`;
      const mailBody = `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${String(message).replace(/\n/g, "<br/>")}</p>
        </div>
      `;

      await sendEmail(receiver, mailSubject, mailBody, mailFrom);
    }

    res.status(201).json({
      message: `Thanks for Contacting Us. You will receive a Response soon at ${newContact.email}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10000, riskLevel = "MEDIUM" } = req.body || {};

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const error = new Error("Invalid latitude or longitude");
      error.statusCode = 400;
      return next(error);
    }

    if (String(riskLevel).toUpperCase() === "LOW") {
      return res.json({ elements: [] });
    }

    const query = buildOverpassQuery(lat, lng, radius, riskLevel);
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      const error = new Error(`Overpass API error: ${response.status}`);
      error.statusCode = 502;
      return next(error);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};
