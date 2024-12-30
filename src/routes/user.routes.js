import express from "express";
import { registerUser,loginUser, logoutUser, changeCurrentPassword,updateUserDetalis, updateUserAvtar,SaveMettingDetalis, getAllMeetings, deleteMeeting } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js";
import {verifyJWT} from '../middlewares/auth.middlewares.js';

const router=express.Router();

router.post('/register',
    upload.fields([  //middle ware multiple files gheto there is pload.single also
        {
            name:"avatar",
            maxCount:1
        }
    ]),
    registerUser
);
router.post('/login',loginUser);
router.post('/logout',logoutUser)
router.put('/passchange',verifyJWT,changeCurrentPassword)
router.put('/updateUserDetalis',verifyJWT,updateUserDetalis)
// router.put('/updateUserAvtar', verifyJWT, upload.single('avatar'), updateUserAvtar);
router.put('/updateUserAvtar', verifyJWT, upload.single('avatar'), (req, res, next) => {
    console.log("Route: File received:", req.file); // Debug log
    console.log("Route: Request body:", req.body); // Debug log

    if (!req.file) {
        return res.status(400).json({ error: "File not uploaded" });
    }

    next(); // Proceed to the actual controller
}, updateUserAvtar);
router.put('/SaveMettingDetalis',verifyJWT,SaveMettingDetalis)
router.put('/getAllMeetings',verifyJWT,getAllMeetings)
router.delete('/deleteMeeting/:meetingId', verifyJWT, deleteMeeting);




export default router;