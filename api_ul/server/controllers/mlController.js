const { exec } = require("child_process");
const File = require("../models/fileModel");

// Existing controller
const predictML = async (req, res) => {
  try {
    const { fileId } = req.params; //Retrieves the fileId from the request parameters (e.g., /api/predict/:fileId).

    const file = await File.findById(fileId); //Queries the database (using the File model) to find the file metadata based on the provided fileId
    if (!file || !file.path) {
      return res.status(404).json({ message: "File not found or missing URL" });
    }

    const imageUrl = file.path;

    exec(
      `python ml_model/inference.py "${imageUrl}"`, 
      (error, stdout, stderr) => {
        //This callback is executed once the Python script finishes its execution.
        if (error) {
          console.error("Prediction error:", stderr || error.message);
          return res
            .status(500)
            .json({ message: "Prediction failed", error: stderr });
        }

        const [label, confidence] = stdout.trim().split("|"); //This assumes inference.py script prints its output in a specific format, e.g., "predicted_label|0.95".

        file.status = "processed";
        file.mlResults = { //Stores the prediction results (label and confidence) in the mlResults field of the file document. 
          predictedClass: label,
          confidence: parseFloat(confidence),
        };
        file.save(); //Saves the updated file document back to the database.

        res.status(200).json({
          message: "Prediction successful",
          result: { predictedClass: label, confidence: parseFloat(confidence) },
        });
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { predictML };
