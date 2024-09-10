import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return{accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong while genrating access token and refresh token")
    }
}


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

const loginUser = asyncHandler(async (req, res) => {

    // 1. req-body -> data
    const { username, email, password } = req.body;

    console.log({ username, email, password }); // Debug: check incoming data

    // 2. Either username or email is required
    if (!username && !email) {
        throw new ApiError(400, "Either username or email is required");
    }

    // 3. Find user [by email or username]
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    console.log(user); // Debug: check if user is found

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    // 4. Check password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    
    console.log(isPasswordCorrect); // Debug: check if password check passes

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }

    // 5. Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    console.log({ accessToken, refreshToken, loggedInUser }); // Debug: Check tokens and user

    // 6. Send cookies (cookie will modify only by server means backend)
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',  // For added security
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $unset:{
                refreshToken:1
            }
        },{
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse (200,{},"User logout")
       )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // 1. Find user by ID
    const user = await User.findById(req.user?._id);  // Ensure req.user is populated

    // Check if user exists
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // 2. Check if the old password is correct (coming from user.model.js)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, 'Invalid old password');
    }

    // 3. Update to the new password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const updateUserDetalis=asyncHandler(async(req,res)=>{
    const {fullName,username,email}=req.body;

    if(!fullName || !username || !email){
        throw new ApiError(400,"Atlist one Filed requried")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,{
            $set:{
                fullName:fullName,
                email:email,
                username:username
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User detalis update succesfully"))
})

const updateUserAvtar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file requred");
    }

    const avatar= await uploadOnClodinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,'Error while uploading avatar file on cloudinary');
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
           $set:{
            avatar:avatar.url
           }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar filed changed succesfully")
    )
})

export{
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    updateUserDetalis,
    updateUserAvtar
};