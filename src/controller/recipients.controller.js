const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const recipientDetail = require("../model/recipient.modal");
const xlsx = require("xlsx");
const { createRecipients, findAllRecipientData } = require("../service/recipients.service");

const addRecipients = async (req, res) => {
  try {
    const {
      name,
      email,
    } = req.body;

    const newUser = {
      name,
      email,
    }
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Please Fill all field is required.",
      });
    }

    // Save the User in the database
    const createdUser = await createRecipients(newUser);
    if (!createdUser) {
      return res.status(401).json({
        success: false,
        message: "Unable to add user.",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Successfully Added User.",
    });
  } catch (err) {
    console.error("User error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};


const importRecipients = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }
    // Read the Excel file buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const recipients = jsonData.map((row) => ({
      name: row.Name,
      email: row.Email,
    }));
    const existingEmails = await recipientDetail.find({
      email: { $in: recipients.map((r) => r.email) }
    });
    if (!existingEmails) {
      return res.status(401).json({
        success: false,
        message: "email id is allready exist.",
      });
    }
   
    if (existingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please check email allready Exist.",
        duplicates: {
          emails: existingEmails.map((e) => e.email),
        },
      });
    }

    // Bulk insert into MongoDB
    await recipientDetail.insertMany(recipients);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully and recipients imported.",
    });
  } catch (error) {
    console.error("Error importing recipients:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


const displayRecipient = async (req, res) => {
  try {

    const recipientData = await findAllRecipientData();
    // Check if there are
    if (!recipientData) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient No found." });
    }

    res.status(200).json({ success: true, data: recipientData });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const AssignCourse = async (req, res) => {
  try {
    const { recipientId, courseId } = req.body;

    // Validate inputs
    if (!recipientId || !courseId) {
      return res.status(400).json({ success: false, message: "Please select a recipient and course." });
    }

    // Find recipient
    const recipient = await recipientDetail.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found." });
    }

    recipient.courseId = courseId;
    await recipient.save();

    res.status(200).json({ success: true, message: "Course assigned successfully.", data: recipient });

  } catch (err) {
    console.error("Error assigning course:", err);
    res.status(500).json({ success: false, message: "Failed to assign course." });
  }
};


module.exports = {
  addRecipients,
  importRecipients,
  displayRecipient,
  AssignCourse
};
