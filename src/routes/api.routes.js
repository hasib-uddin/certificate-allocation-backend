const router = require("express").Router();
const { getCertificateDownload } = require("../controller/course.controller");
const courseRoutes = require("./course.routes");
const recipientsRoutes = require("./recipients.routes");

router.use("/course", courseRoutes);
router.use("/recipients", recipientsRoutes);
router.get("/id=:recipientId", getCertificateDownload);

module.exports = router;
