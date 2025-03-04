const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const certificatesSchema = new Schema({
  courseName: String,
  courseId: { type: String, unique: true },
  startDate: Date,
  endDate: Date,
  templateUrl: String,  
  badgeUrl: String,     
  recipients: [{
    name: String,
    uniqueId: String,
    email: String,
    pdfPath: String     
  }]
}, { timestamps: true }); 

module.exports = mongoose.model('certificates', certificatesSchema);