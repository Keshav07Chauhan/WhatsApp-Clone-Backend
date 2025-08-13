import express from "express";
import {
    getContactsList,
    addContactByPhone,
    registerContact,
    loginContact
} from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.post("/register", registerContact);
router.post("/login", loginContact);

// Protected
router.get("/", verifyJWT, getContactsList);
router.post("/add", verifyJWT, addContactByPhone);

export default router;
