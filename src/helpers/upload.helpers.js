const fs = require("fs");
const path = require("path");
const util = require("util");

const {
  guessExtensionFromType,
  guessTypeFromExtension,
} = require("./mimeTypes.helpers");

// generate random (unique) image name
function getRandomFileName() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  var random = ("" + Math.random()).substring(2, 8);
  var random_number = timestamp + random;
  return random_number;
}

// Image Upload

const fileUpload = async (
  file,
  destination = "",
  allowedExtensions = [],
  thumbnail = false,
  height = 200,
  width = 200,
  minFileSizeInMB = 0,
  maxFileSizeInMB = 10
) => {
  try {
    // Destination for uploaded files
    const uploadFilepath = path.join(__dirname, "../public", destination);
    
    // Generate a unique filename
    const uniqueName = getRandomFileName();
    const fileExt = path.extname(file.name).replace(".", ""); // File extension
    const fileMimetype = file.mimetype; // File mimetype
    const fileSizeInMB = file.size / (1024 * 1024); // File size in MB

    // Construct file name
    const fileName = `${uniqueName}.${fileExt}`;
    const finalFilePath = path.join(uploadFilepath, fileName);

    // Validate file extension
    const checkedExt = await guessExtensionFromType(fileMimetype, fileExt);
    if (checkedExt !== fileExt) {
      throw new Error(`Not a valid "${fileExt}" type file.`);
    }

    // Check allowed file extensions
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExt)) {
      throw new Error(`Only ${allowedExtensions.join("|")} files are allowed.`);
    }

    // Check file size limits
    if (fileSizeInMB > maxFileSizeInMB) {
      throw new Error(`File size must be less than ${maxFileSizeInMB} MB.`);
    }
    if (fileSizeInMB < minFileSizeInMB) {
      throw new Error(`File size must be more than ${minFileSizeInMB} MB.`);
    }

    // Ensure directory exists before uploading
    await fs.promises.mkdir(uploadFilepath, { recursive: true });

    // Move file to destination
    const moveFile = util.promisify(file.mv);
    await moveFile(finalFilePath);

    return {
      ok: true,
      status: "success",
      message: "File successfully uploaded.",
      fileName,
      filePath: finalFilePath,
    };
  } catch (err) {
    return { ok: false, status: "failure", message: err.message };
  }
};

// const copyFile = async (sourceDir, targetDir, new_id, res) => {
//   // asyncErrorHandler(async () => {
//   try {
//     if (!fs.existsSync(targetDir)) {
//       fs.mkdirSync(targetDir);
//     }

//     fs.readdir(sourceDir, async (err, files) => {
//       if (err) {
//         console.error(
//           `Error reading source directory ${sourceDir}: ${err.message}`
//         );
//         return;
//       }

//       for (let fileName of files) {
//         // files.map(async (fileName) => {
//         const sourcePath = path.join(sourceDir, fileName);
//         const targetPath = path.join(targetDir, fileName);
//         const readStream = fs.createReadStream(sourcePath);
//         const writeStream = fs.createWriteStream(targetPath);

//         readStream.pipe(writeStream);

//         readStream.on("error", (err) => {
//           console.error(`Error reading file ${sourcePath}: ${err.message}`);
//         });

//         writeStream.on("error", (err) => {
//           console.error(`Error writing file ${targetPath}: ${err.message}`);
//         });

//         let updatedFile = await QueryAddFileToLessonLog({
//           file_name: fileName,
//           lesson_id: new_id,
//         });
//         if (updatedFile === false) {
//           return sendResponse(
//             res,
//             400,
//             false,
//             "Unable to copy thumbnail image."
//           );
//         }
//       }
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };


module.exports = {
  fileUpload,
  getRandomFileName,
  // copyFile,
};
