import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Retrieve the token from cookies or the Authorization header
        const token = req.cookies?.accessToken || 
                      req.header("Authorization")?.replace("Bearer ", "");

        // Check if token exists
        if (!token) {
            throw new ApiError(401, "Unauthorized request, token missing");
        }

        // Verify the JWT token using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Retrieve the user based on the decoded token's _id, excluding password and refreshToken
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // If no user is found, throw an error
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        // Attach the user object to the request for future middleware or route handlers
        req.user = user;
        next();
        
    } catch (error) {
        // Handle any token verification or database errors
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
