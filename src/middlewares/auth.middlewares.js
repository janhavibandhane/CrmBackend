import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/users.model.js"

export const verifyJWT=asyncHandler(async(req,res,next)=>

    {
    try {
        //mobile app use karto tr req.header karun yeil token
        const token=req.cookies?.accessToken || req.header    //req.cookier user kadun cookie bhetay tr gheyche
        ("Authorization")?.replace("Bearer ","")              //req.header kadun gheyche ny tr cookie
    
        if(!token){
            throw new ApiError(401,"Unauthorized reques")
        }
        //jwt decoed karto
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        // _id aplayala ka bhete karn user model madhe apn accestoken la id dile
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"invalid acces token")
        }
         req.user=user;
         next()

         
    } catch (error) {
        throw new ApiError(401,error?.message ||"invalid acces token")
    }
})