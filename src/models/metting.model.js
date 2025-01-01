// src/models/meeting.model.js
import mongoose, { Schema } from "mongoose";

// Define Meeting Schema
const meetingSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
    },
    Meetingdetails: {
        type: String,
        required: true,
    },
    Meetingdate: {
        type: Date,
        required: true,
    },
    Meetingtime: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create Meeting model
export const Meeting = mongoose.model("Meeting", meetingSchema);
