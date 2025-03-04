require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./src/model/index");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/qrcodes", express.static(path.join(__dirname, "public/qrcodes")));
app.use("/certificates", express.static(path.join(__dirname, "public/certificates")));
app.use(fileUpload());

app.use(express.json());
app.use(express.urlencoded({extended: false}));
const apiRoutes = require("./src/routes/api.routes");
app.use(cors("*"));
const port = process.env.PORT || 4001;

app.use("/", apiRoutes);

app.all("*", (req, res) => {
  return res
    .status(404)
    .json({ success: false, message: "Page not found Index" });
});

app.listen(port, () => {
  console.log("Server is listening at", port);
});
