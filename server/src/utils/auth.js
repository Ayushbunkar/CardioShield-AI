import jwt from "jsonwebtoken";

const IS_PROD = process.env.NODE_ENV === "production";

const genToken = (userID, res) => {
  const token = jwt.sign({ ID: userID }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("IDCard", token, {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
  });
};

export default genToken;
