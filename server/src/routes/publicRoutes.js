import express from "express";
import { ContactUs } from "../controllers/publicController.js";


const router = express.Router();

router.post("/contactus", ContactUs);


export default router;
