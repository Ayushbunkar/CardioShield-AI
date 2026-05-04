import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error(
      "[DB] MONGO_URI is not set!\n" +
      "  → Local: add MONGO_URI=mongodb+srv://... to server/.env\n" +
      "  → Render: add MONGO_URI in Dashboard → Environment"
    );
    return { ok: false, reason: "missing-uri" };
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log("MongoDB Connected :", conn.connection.host);
    return { ok: true };
  } catch (error) {
    console.log("Error connecting Db : ", error);
    return { ok: false, reason: "connect-failed" };
  }
};

export default connectDB;