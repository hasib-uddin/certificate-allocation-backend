const recipientDetail = require("../model/recipient.modal");
const { getCurrentDateAndTimeIndia } = require("../helpers/local.helper");

const xlsx = require("xlsx");


const findUsers = async () => {
  try {
    return await User.find({ isDeleted: 0 })
      .select("-password") // Exclude specified fields from the result
      .exec();
  } catch (err) {
    console.error("Error fetching users from the database:", err.message || err);
    throw new Error("An error occurred while retrieving users. Please try again later.");
  }
};

const createRecipients = async (info) => {
  try {
    const newUser = new recipientDetail(info);
    const savedUser = await newUser.save();
    return savedUser instanceof recipientDetail ? savedUser.toJSON() : false;
  } catch (err) {
    console.log(err);
    return false;
  }
};


const  importRecipientsFromExcel= async(fileBuffer)=> {
  try {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const recipients = jsonData.map((row) => ({
      name: row.Name, 
      email: row.Email,
    }));

    // Bulk insert into MongoDB
    await recipientDetail.insertMany(recipients);
    return { success: true, message: "Recipients imported successfully" };
  } catch (error) {
    console.error("Error importing recipients:", error);
    throw new Error("Failed to import recipients");
  }
}
const findAllRecipientData = async () => {
  try {
    const courseData = await recipientDetail.find();

    return courseData.length > 0 ? courseData : false;
  } catch (err) {
    console.error("Error fetching course:", err);
    return null; 
  }
};

module.exports = {
  createRecipients,
  findUsers,
  importRecipientsFromExcel,
  findAllRecipientData

};
