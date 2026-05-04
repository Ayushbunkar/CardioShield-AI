import express from "express";
import { ContactUs, getNearbyPlaces } from "../controllers/publicController.js";


const router = express.Router();

router.post("/contactus", ContactUs);
router.post("/nearby-places", getNearbyPlaces);


export default router;
