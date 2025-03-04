const config = require("../config/db.config");
const mongoose = require("mongoose");
mongoose
  .connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected successfully to database");
  })
  .catch((error) => {
    console.error("Error connecting to database:", config.db, error);
    // Throw the error further if you want to handle it elsewhere or terminate the application.
    throw error;
  });

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
  // Optionally, you can handle additional error handling or cleanup here.
});
