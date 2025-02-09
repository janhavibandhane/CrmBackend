import express from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    updateUserDetalis,
    updateUserAvtar 
} from "../controllers/user.controllers.js";

import { 
    SaveMeetingDetails,
    getAllMeetings,
    deleteMeeting 
} from "../controllers/metting.controllers.js";

import { 
    getNoteByDate, 
    saveOrUpdateNote 
} from "../controllers/calender.controllers.js";
import {
    exportLeads,
    importLeads,
    addSingleLead,
    addColumn,
    addRow,
} from "../controllers/leads.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = express.Router();

// User Routes
router.post('/register',
    upload.fields([
        { name: "avatar", maxCount: 1 }
    ]),
    registerUser
);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/passchange', verifyJWT, changeCurrentPassword);
router.put('/updateUserDetalis', verifyJWT, updateUserDetalis);

router.put('/updateUserAvtar', verifyJWT, upload.single('avatar'), (req, res, next) => {
    console.log("Route: File received:", req.file); 
    console.log("Route: Request body:", req.body); 

    if (!req.file) {
        return res.status(400).json({ error: "File not uploaded" });
    }

    next(); // Proceed to the actual controller
}, updateUserAvtar);

// Meeting Routes
router.put('/SaveMettingDetalis', verifyJWT, SaveMeetingDetails);
router.get('/getAllMeetings', verifyJWT, getAllMeetings); // Changed to GET for retrieving meetings
router.delete('/deleteMeeting/:meetingId', verifyJWT, deleteMeeting);

// Calendar Routes
router.post('/saveOrUpdateNote', verifyJWT, saveOrUpdateNote);
router.get('/getNoteByDate', verifyJWT, getNoteByDate);

// Leads Routes

router.get("/export", verifyJWT, exportLeads); // Export all leads to Excel
router.post("/import", upload.single("file"), (req, res, next) => {
    console.log("Received file:", req.file); // Should log file details if file is uploaded
    console.log("Form data:", req.body);    // Should log other form data (if any)
    if (!req.file) {
        return res.status(400).json({ error: "File not received. Please check the field name." });
    }
    next();
}, importLeads);
router.post("/add", verifyJWT, addSingleLead); // Add a single lead
router.post("/add-column", verifyJWT, addColumn); // Add a new column to all leads
router.post("/add-row", verifyJWT, addRow); // Add a blank row (lead)

export default router;
