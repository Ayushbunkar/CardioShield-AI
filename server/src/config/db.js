import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error(
      "[DB] MONGO_URI is not set!\n" +
      "  → Local: add MONGO_URI=mongodb+srv://... to server/.env\n" +
      "  → Render: add MONGO_URI in Dashboard → Environment"
    );
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log("MongoDB Connected :", conn.connection.host);
  } catch (error) {
    console.log("Error connecting Db : ", error);
    process.exit(1);
  }
};

export default connectDB;