import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Meeting } from "../models/metting.model.js";


// Save Meeting Details
const SaveMeetingDetails = asyncHandler(async (req, res) => {
    const { Meetingdetails, Meetingdate, Meetingtime } = req.body;

    // 1. Validate input
    if (!Meetingdetails || !Meetingdate || !Meetingtime) {
        throw new Error("All fields (Meetingdetails, Meetingdate, Meetingtime) are required.");
    }

    // 2. Get the logged-in user's ID
    const userId = req.user._id; // Assume `req.user._id` is available after authentication

    // 3. Create a new meeting
    const meeting = await Meeting.create({
        user: userId,
        Meetingdetails,
        Meetingdate,
        Meetingtime,
    });

    // 4. Send a response
    res.status(201).json({
        message: "Meeting details saved successfully.",
        meeting, // Return the saved meeting
    });
});

// Get All Meetings for Logged-in User
const getAllMeetings = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Assume `req.user._id` is available after authentication

    // 1. Find all meetings for the user
    const meetings = await Meeting.find({ user: userId });

    // 2. Return the meetings
    res.status(200).json({
        message: "Meetings retrieved successfully.",
        meetings,
    });
});

// Delete a Meeting
const deleteMeeting = asyncHandler(async (req, res) => {
    const meetingId = req.params.meetingId.trim(); // Extract and trim the meeting ID from the route parameter

    // 1. Validate meetingId format (must be a valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
        return res.status(400).json({ error: "Invalid meeting ID format." });
    }

    // 2. Get the logged-in user's ID
    const userId = req.user._id;

    // 3. Find and delete the meeting
    const meeting = await Meeting.findOneAndDelete({
        _id: meetingId,
        user: userId, // Ensure the meeting belongs to the logged-in user
    });

    if (!meeting) {
        return res.status(404).json({ error: "Meeting not found." });
    }

    // 4. Send a success response
    res.status(200).json({
        message: "Meeting deleted successfully.",
    });
});

export {
    SaveMeetingDetails,
    getAllMeetings,
    deleteMeeting,
};
