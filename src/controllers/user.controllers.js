import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"




const registerUser = asyncHandler ( async (req,res)=>{

    // 1.get user details from frontend
     const{fullName,email,username,password}=req.body;

     // 2.Validation
     if ([ fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(404, "All fields are required");
    }
    
    // 3.Check if user already exists
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    });
    if(existedUser){
        throw new ApiError(409,"USer with email and password is alredy exist");
    }

    //     4.check for images,check for avatar
    const avatarLocalPath=req.files?.avatar?.[0]?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar fild is requred");
    }

    //5.Upload them to Cloudinary, avatar and coverImage
     const avatar=await uploadOnClodinary(avatarLocalPath);
     if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar");
    }

    //     6.create user object-create entry in db
    const user=await User.create({
        fullName,
        email,
        avatar:avatar.url,
        password,
        username
    })

    //7.Remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    //8.Check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Registering user: something went wrong");
    }

    //9.Return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );
})

const loginUser=asyncHandler( async (req,res)=>{

    //1.req-body ->data
    const{username,email,password}=req.body;

     //2.username or email
    if(!username && !email){
        throw new ApiError(400,"USername and email requried");
    }

    //3.find user [by email or username]
    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"User not exist");
    }

    const isPasswordCorrect=await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(401,"Password invalid");
    }
})

export{
    registerUser,
};