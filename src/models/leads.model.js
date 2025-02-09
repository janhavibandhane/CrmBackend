import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    jobTitle: { type: String, required: false },
    customFields: { type: Map, of: String, default: {} },  // Use Map to store dynamic fields
});

export const Lead = mongoose.model("Lead", leadSchema);
