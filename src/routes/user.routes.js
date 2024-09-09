import express from "express";
import { registerUser,loginUser, logoutUser } from "../controllers/user.controllers.js";
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


export default router;