const express = require("express");
const QRCode = require("qrcode");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Recipient = require("../model/recipient.modal"); // Recipient Model
const courseDetail = require("../model/course.modal");



const { createCourse, findAllCourseData } = require("../service/course.service");
const { fileUpload } = require("../helpers/upload.helpers");


const addCourse = async (req, res) => {
  try {
    const {
      coursName,
      tenureStart,
      tenureEnd,
      description } = req.body;

    const newCourse = {
      coursName,
      tenureStart,
      tenureEnd,
      description,
  
    }
    if (!coursName || !tenureStart || !tenureEnd || !description) {
      return res.status(400).json({
        success: false,
        message: "Please Fill all field is required.",
      });
    }

    // Save the course in the database
    const createdCourse = await createCourse(newCourse);
    if (!createdCourse) {
      return res.status(401).json({
        success: false,
        message: "Unable to create course.",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Successfully Created Course.",
    });
  } catch (err) {
    console.error("Course error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

const displayCourse = async (req, res) => {
  try {

    const courseData = await findAllCourseData();
    // Check if there are
    if (!courseData) {
      return res
        .status(404)
        .json({ success: false, message: "Course No found." });
    }

    res.status(200).json({ success: true, data: courseData });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};


const addTemplateAndBadge = async (req, res) => {
  try {
    const id = req.params.id;
    const templateFile = req.files?.template;
    const badgeFile = req.files?.badge;

    if (!id) {
      return res.status(400).json({ success: false, message: "Course ID is required." });
    }

    if (!templateFile || !badgeFile) {
      return res.status(400).json({ success: false, message: "Template and badge files are required." });
    }

    const course = await courseDetail.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (templateFile) {
      const templateUpload = await fileUpload(
        templateFile,
        `certificates/${course._id}/template`, 
        ["jpg", "jpeg", "png", "webp", "avif"], 
        false,
        200,
        200
      );
      if (templateUpload.ok) {
        course.templateUrl = `certificates/${course._id}/template`;
      } else {
        throw new Error(templateUpload.message);
      }
    }

    if (badgeFile) {
      const badgeUpload = await fileUpload(
        badgeFile, 
        `certificates/${course._id}/badge`, 
        ["jpg", "jpeg", "png", "webp", "avif"],
        false,
        200,
        200
      );
      if (badgeUpload.ok) {
        course.badgeUrl = `certificates/${course._id}/badge`;
      } else {
        throw new Error(badgeUpload.message);
      }
    }

    // Save updated course details
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Template and badge uploaded successfully.",
      course,
    });

  } catch (error) {
    console.error("Error in addTemplateAndBadge:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const getCertificateById = async (req, res) => {
  try {
    const { recipientId } = req.params;

    const recipient = await Recipient.findById(recipientId);
    if (!recipient) return res.status(404).json({ error: "Recipient not found" });

    const courseData = await courseDetail.findById(recipient.courseId);
    if (!courseData) return res.status(404).json({ error: "Course details not found" });

    const publicDir = path.join(__dirname, "../public");
    const qrCodeDir = path.join(publicDir, "qrcodes");
    const certDir = path.join(publicDir, "certificates", recipient._id.toString()); // Unique folder per recipient

    if (!fs.existsSync(qrCodeDir)) fs.mkdirSync(qrCodeDir, { recursive: true });
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

    const qrCodePath = path.join(qrCodeDir, `${recipient._id}.png`);
    const pdfPath = path.join(certDir, "certificate.pdf");
    const templatePath = path.join(publicDir, "certificates", courseData._id.toString(), "template.jpg");
    const badgePath = path.join(publicDir, "certificates", courseData._id.toString(), "badge.jpg");

    await QRCode.toFile(qrCodePath, `http://localhost:4000/id=${recipient._id}`);

    const doc = new PDFDocument({ size: "A4" });
    doc.pipe(fs.createWriteStream(pdfPath));


    doc.fontSize(24).text("Certificate of Completion", { align: "center" }).moveDown();
    doc.fontSize(18).text(`This certifies that`, { align: "center" }).moveDown();
    doc.fontSize(20).text(`${recipient.name}`, { align: "center", bold: true }).moveDown();
    doc.fontSize(16).text(`Has successfully completed the course`, { align: "center" }).moveDown();
    doc.fontSize(18).text(`${courseData.coursName}`, { align: "center", bold: true }).moveDown();
    doc.fontSize(14).text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });

    doc.image(qrCodePath, 250, 500, { width: 100 });

    doc.end();

    return res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      recipient: {
        id: recipient._id,
        name: recipient.name,
        email: recipient.email,
        course: {
          id: courseData._id,
          name: courseData.coursName,
          description: courseData.description,
          tenureStart: courseData.tenureStart,
          tenureEnd: courseData.tenureEnd,
        },
        qrCodeUrl: `http://localhost:4000/qrcodes/${recipient._id}.png`,
        templateUrl: templatePath ? `http://localhost:4000/public/certificates/${courseData._id}/template.jpg` : null,
        badgeUrl: badgePath ? `http://localhost:4000/public/certificates/${courseData._id}/badge.jpg` : null,
        certificateUrl: `http://localhost:4000/certificates/${recipient._id}/certificate.pdf`,
      },
    });

  } catch (error) {
    console.error(" Error generating certificate:", error);
    return res.status(500).json({ error: "Failed to generate certificate" });
  }
};


const getCertificateDownload = async (req, res) => {
  try {
    const { recipientId } = req.params;

    const recipient = await Recipient.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    const courseData = await courseDetail.findById(recipient.courseId);
    if (!courseData) {
      return res.status(404).json({ success: false, message: "Course details not found" });
    }

    const pdfPath = path.join(__dirname, `../public/certificates/${recipientId}/certificate.pdf`);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ success: false, message: "Certificate PDF not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate found",
      recipient: {
        id: recipient._id,
        name: recipient.name,
        email: recipient.email,
        course: {
          id: courseData._id,
          name: courseData.coursName,
          description: courseData.description,
          tenureStart: courseData.tenureStart,
          tenureEnd: courseData.tenureEnd,
        },
        qrCodeUrl: `http://localhost:4000/public/qrcodes/${recipientId}.png`,
        templateUrl: `http://localhost:4000/public/certificates/${courseData._id}/template.jpg`,
        badgeUrl: `http://localhost:4000/public/certificates/${courseData._id}/badge.jpg`,
        certificateUrl: `http://localhost:4000/public/certificates/${recipientId}.pdf`,
      },
    });

  } catch (error) {
    console.error(" Error fetching certificate:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addCourse,
  displayCourse,
  addTemplateAndBadge,
  getCertificateById,
  getCertificateDownload

};
