const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const destinationPath = getDestinationPath(req.path);
    callback(null, destinationPath);
  },
  filename: (req, file, callback) => {
    // Save the original name and file type in the file object
    file.originalname = file.originalname;
    file.fileType = file.mimetype;

    // Create a unique file name for storage
    const fileName = `${Date.now()}_${file.originalname}`;
    callback(null, fileName);
  },
});

function getDestinationPath(requestPath) {
  // Split the request path by '/' and take the first part
  const [mainPath] = requestPath.split('/').filter(Boolean);

  // Define logic to determine destination path based on the main path
  switch (mainPath) {
    case "catalogs":
      return path.resolve(__dirname, "../../uploads/catalogs");
    case "articles":
      return path.resolve(__dirname, "../../uploads/articles");
    default:
      // Default destination if no specific path is matched
      return path.resolve(__dirname, "../uploads/default");
  }
}

const upload = multer({ storage: storage });

module.exports = upload;
