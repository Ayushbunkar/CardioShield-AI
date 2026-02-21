import { response } from "express";
import Contact from "../models/contactModel.js";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary.js";
import Banquet from "../models/BanquetModel.js";

const UploadMultipleToCloudinary = async (Images) => {

  const uploadPromises = Images.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "EventManagement",
      width: 500,
      height: 500,
      crop: "fill",
    });

    return result.secure_url;
  });

  const ImageUrls = await Promise.all(uploadPromises);

  return ImageUrls;
};

export const GetAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({ message: "All Contacts Fetched", data: contacts });
  } catch (error) {
    next(error);
  }
};

export const UpdateContacts = async (req, res, next) => {
  try {
    const QueryId = req.params.Qid;
    const { status, reply } = req.body;

    const updatedQuery = await Contact.findByIdAndUpdate(
      QueryId,
      {
        status,
        reply,
      },
      { new: true }
    );

    const statusColors = {
      Pending: "#f0ad4e",
      Resolved: "#5cb85c",
      Rejected: "#d9534f",
    };
    const mailBody = `
     <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 30px;">
      <h2 style="color: #333333;">Message Status Notification</h2>

      <p style="margin: 10px 0;"><strong style="color: #555;">Name:</strong> <span style="color: #000;">${
        updatedQuery.name
      }</span></p>

      <p style="margin: 10px 0;"><strong style="color: #555;">Phone:</strong> <span style="color: #000;">${
        updatedQuery.phone
      }</span></p>

      <p style="margin: 10px 0;"><strong style="color: #555;">Original Message:</strong><br />
        <span style="color: #000;">${updatedQuery.message}</span>
      </p>

      <p style="margin: 10px 0;"><strong style="color: #555;">Festive Flair Reply:</strong><br />
        <span style="color: #000;">${updatedQuery.reply}</span>
      </p>

       <p style="margin: 10px 0;"><strong style="color: #555;">Note:</strong>
        <span style="color: #000;">Please Contact Again if Required.</span>
      </p>

      <p style="margin: 10px 0;">
        <strong style="color: #555;">Status:</strong>
        <span style="display: inline-block; padding: 6px 12px; font-weight: bold; border-radius: 5px; color: #fff; background-color: ${
          statusColors[updatedQuery.status]
        };">
          ${updatedQuery.status}
        </span>
      </p>

      
      <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} Festive Flair Event Planner PVT. LTD. | All rights reserved.
      </p>
    </div>
  </div>
    `;

    const MailStatus = await sendEmail(
      updatedQuery.email,
      updatedQuery.subject,
      mailBody
    );

    if (!MailStatus) {
      console.log("Error Sending Email");
    }

    res.status(200).json({ message: "Contact Updated", data: updatedQuery });
  } catch (error) {
    next(error);
  }
};

export const AddNewBanquetHall = async (req, res, next) => {
  try {
    const {
      hallName,
      address,
      capacity,
      managerName,
      contactNumber,
      email,
      rent,
      minBookingAmount,
      featureDescription,
    } = req.body;

    const imageFiles = req.files;
    const photos = await UploadMultipleToCloudinary(imageFiles);
    console.log(photos);
    if (photos.length <= 0) {
      const error = new Error("Fail to Upload Photos");
      error.statusCode = 502;
      return next(error);
    }
    const NewBanquetHall = await Banquet.create({
      hallName,
      address,
      capacity,
      managerName,
      contactNumber,
      email,
      rent,
      minBookingAmount,
      featureDescription,
      photos,
    });

    res
      .status(200)
      .json({ message: "Banquet Hall Added", data: NewBanquetHall });
  } catch (error) {
    next(error);
  }
};