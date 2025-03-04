const router = require("express").Router();
const {addRecipients, importRecipients,displayRecipient,AssignCourse} = require("../controller/recipients.controller");
const { verifyToken } = require("../middleware/auth.middlewares");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/add_recipient", addRecipients);
router.post("/add_bulk_recipient", upload.single("excelFile"), importRecipients);
router.get("/get_recipient", displayRecipient);
router.post("/assign_course", AssignCourse);




module.exports = router;
