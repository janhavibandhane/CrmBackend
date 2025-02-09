import xlsx from "xlsx";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Lead } from "../models/leads.model.js"; // Assuming you have a Lead model
import fs from "fs";
import path from "path";

// Export Leads to Excel
const exportLeads = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Ensure user-based filtering
    const leads = await Lead.find({ user: userId }); // Fetch all leads for the logged-in user

    if (!leads || leads.length === 0) {
        return res.status(404).json({ error: "No leads found to export." });
    }

    const leadsData = leads.map((lead) => ({
        Name: lead.name || "",
        Email: lead.email || "",
        Phone: lead.phone || "",
        JobTitle: lead.jobTitle || "",
        ...lead.customFields, // Include dynamic/custom columns if any
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(leadsData);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Leads");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");
    res.status(200).send(buffer);
});

// Import Leads from Excel
// const importLeads = asyncHandler(async (req, res) => {
//     const fileBuffer = req.file.buffer; //fileBuffer will read the file content

//     if (!fileBuffer) {
//         return res.status(400).json({ error: "No file uploaded." });
//     }

//     const workbook = xlsx.read(fileBuffer, { type: "buffer" }); //read uploaded file from buffer
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     // const importedLeads = xlsx.utils.sheet_to_json(worksheet); convert sheet data into array

//     const userId = req.user._id; // Get the logged-in user's ID

//     const leads = importedLeads.map((lead) => ({
//         user: userId,
//         name: lead.Name || "",
//         email: lead.Email || "",
//         phone: lead.Phone || "",
//         jobTitle: lead.JobTitle || "",
//         customFields: { ...lead }, // Keep additional dynamic fields
//     }));

//     await Lead.insertMany(leads);

//     res.status(200).json({
//         message: "Leads imported successfully.",
//         importedCount: leads.length,
//     });
// });

const importLeads = asyncHandler(async (req, res) => {
    const filePath = path.join(__dirname, "../Public/temp", req.file.filename); // Get file path

    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    const fileBuffer = fs.readFileSync(filePath); // Read file from disk
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const importedLeads = xlsx.utils.sheet_to_json(worksheet);

    const userId = req.user._id;

    const leads = importedLeads.map((lead) => ({
        user: userId,
        name: lead.Name || "",
        email: lead.Email || "",
        phone: lead.Phone || "",
        jobTitle: lead.JobTitle || "",
        customFields: { ...lead },
    }));

    await Lead.insertMany(leads);

    res.status(200).json({
        message: "Leads imported successfully.",
        importedCount: leads.length,
    });

    // Optionally delete the file after processing
    fs.unlinkSync(filePath);
});

// Add a New Column
const addColumn = asyncHandler(async (req, res) => {
    const { columnName } = req.body;

    if (!columnName || columnName.trim() === "") {
        return res.status(400).json({ error: "Column name is required." });
    }

    const userId = req.user._id;

    // Add the column to all leads for the user (set default value as an empty string)
    await Lead.updateMany(
        { user: userId },
        { $set: { [`customFields.${columnName}`]: "" } } // Use the correct dynamic field syntax
    );

    res.status(200).json({
        message: `Column '${columnName}' added successfully to all leads.`,
    });
});


// Add Single Lead
const addSingleLead = asyncHandler(async (req, res) => {
    const { name, email, phone, jobTitle, ...customFields } = req.body; // Destructure the custom fields

    if (!name || !email || !phone || !jobTitle) {
        return res.status(400).json({
            error: "All fields (name, email, phone, jobTitle) are required.",
        });
    }

    const userId = req.user._id; // Get the logged-in user's ID

    // Create the lead with customFields properly nested
    const lead = await Lead.create({
        user: userId,
        name,
        email,
        phone,
        jobTitle,
        customFields: customFields || {}, // Store custom fields dynamically
    });

    res.status(201).json({
        message: "Lead added successfully.",
        lead,
    });
});




// Add a Blank Row
const addRow = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const newLead = await Lead.create(
        {
            user: userId,
            name: "",   // Empty value for name
            email: "",  // Empty value for email
            phone: "",  // Empty value for phone
            jobTitle: "", // Empty value for jobTitle
            customFields: {},  // Blank custom fields
        },
        { validate: false }  // Bypass schema validation
    );

    res.status(201).json({
        message: "Blank row added successfully.",
        newLead,
    });
});


export {
    exportLeads,
    importLeads,
    addSingleLead,
    addColumn, 
    addRow,
};
