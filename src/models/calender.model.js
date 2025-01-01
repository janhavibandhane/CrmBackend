import mongoose, { Schema } from "mongoose";
const calendarSchema = new Schema({
    userId: { // Change _id to userId
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: String, // Use ISO date string (e.g., "2024-12-31")
        required: true,
    },
    notes: {
        type: String,
        default: "",
    },
});

export const Calender = mongoose.model("Calender", calendarSchema);

        
    