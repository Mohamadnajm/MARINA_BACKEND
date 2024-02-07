const Achat = require("../../models/achat/Achat");

const isAchatReferenceOccupied = async (ref) => {
  try {
    const existingAchat = await Achat.findOne({ ref: ref });
    return existingAchat !== null;
  } catch (error) {
    console.error("Error checking user reference:", error);
    throw error;
  }
};

const GenerateAchatReference = async () => {
  try {
    const AchatsCount = await Achat.countDocuments();
    let incrementedCount = AchatsCount + 1;

    let formattedReference;
    let isOccupied;

    do {
      formattedReference = incrementedCount;

      isOccupied = await isAchatReferenceOccupied(formattedReference);

      if (isOccupied) {
        incrementedCount++;
      }
    } while (isOccupied);

    return formattedReference;
  } catch (error) {
    console.error("Error generating user reference:", error);
    throw error;
  }
};

module.exports = GenerateAchatReference;
