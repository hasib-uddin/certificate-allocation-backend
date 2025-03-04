const router = require("express").Router();
const {addCourse, infoFromToken,displayCourse,addTemplateAndBadge,
    getCertificateById} = require("../controller/course.controller");

router.post("/add_course", addCourse);
router.get("/get_course", displayCourse);
router.post("/add_template/:id", addTemplateAndBadge);
router.post("/generate-certificate/:recipientId", getCertificateById);


module.exports = router;
