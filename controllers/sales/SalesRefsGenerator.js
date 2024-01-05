const Sale = require("../../models/sales/Sales");

const isSalesReferenceOccupied = async (ref) => {
  try {
    const existingSale = await Sale.findOne({ ref: ref });
    return existingSale !== null;
  } catch (error) {
    console.error("Error checking user reference:", error);
    throw error;
  }
};

const GenerateSalesReference = async () => {
  try {
    const SalesCount = await Sale.countDocuments();
    let incrementedCount = SalesCount + 1;

    let formattedReference;
    let isOccupied;

    do {
      formattedReference = incrementedCount;

      isOccupied = await isSalesReferenceOccupied(formattedReference);

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

module.exports = GenerateSalesReference;
