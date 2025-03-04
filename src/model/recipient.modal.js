const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipientSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", }

});
module.exports = mongoose.model("recipient", recipientSchema);

