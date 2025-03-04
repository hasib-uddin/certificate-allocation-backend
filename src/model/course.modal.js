const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    coursName: { type: String, required: true },
    tenureStart: { type: String, required: true },
    tenureEnd: { type: String, required: true},
    description: { type: String, required: true },
    templateUrl: { type: String },
    badgeUrl: { type: String },
});
module.exports = mongoose.model("course", courseSchema);
