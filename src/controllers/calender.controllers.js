import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Calender } from "../models/calender.model.js";
import { ApiError } from "../utils/ApiError.js";

const saveOrUpdateNote = asyncHandler(async (req, res) => {
    const { date, notes } = req.body; // Use req.body for POST request data
    const userId = req.user._id; // Assume user ID is available after authentication

    // Validate input
    if (!date || typeof notes !== "string") {
        throw new ApiError(400, "Date and notes are required");
    }

    // Save or update the note
    const calendarEntry = await Calender.findOneAndUpdate(
        { userId, date },
        { $set: { notes } },
        { new: true, upsert: true }
    );

    res.status(200).json({ message: "Note saved/updated successfully", date, notes });
});

const getNoteByDate = asyncHandler(async (req, res) => {
    const { date } = req.query;  // Get date from query parameters
    const userId = req.user._id; // Assume user ID is available after authentication

    // Validate input
    if (!date) {
        throw new ApiError(400, "Date is required");
    }

    // Fetch the note from the database for the given date
    const calendarEntry = await Calender.findOne({ userId, date });

    if (!calendarEntry) {
        return res.status(404).json({ message: "No note found for this date" });
    }

    res.status(200).json({ date: calendarEntry.date, notes: calendarEntry.notes });
});


export{
    saveOrUpdateNote,
    getNoteByDate
}