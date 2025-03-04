const courseDetail = require("../model/course.modal");
const { getCurrentDateAndTimeIndia } = require("../helpers/local.helper");



const findOne = async (info) => {
  try {
    const user = await User.findOne(info);
    return user ? user.toJSON() : false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

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

const createCourse = async (info) => {
  try {
    const newCourse = new courseDetail(info);
    const savedCourse = await newCourse.save();
    return savedCourse instanceof courseDetail ? savedCourse.toJSON() : false;
  } catch (err) {
    console.log(err);
    return false;
  }
};


const findAllCourseData = async () => {
  try {
    const courseData = await courseDetail.find();

    // Log and return course Data if found, or false if not
    return courseData.length > 0 ? courseData : false;
  } catch (err) {
    console.error("Error fetching course:", err);
    return null; // Return null to indicate an error occurred
  }
};

module.exports = {
  findOne,
  findUsers,
  createCourse,
  findAllCourseData,

};
