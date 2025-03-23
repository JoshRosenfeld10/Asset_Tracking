const express = require("express"),
  router = express.Router(),
  formatInputData = require("../utils/formatInputData"),
  googleSheetUI = require("../constants/googleSheetUI"),
  generatePDF = require("../utils/generatePDF");

router.use(express.json());

router.post("/", async (req, res) => {
  try {
    const { data, startRow } = req.body;

    // Format input data
    const formattedData = await formatInputData(data);

    for (const obj of formattedData) {
      // Compute the rows numbers that the PDF should be stored on
      const rowNumbers = data.reduce((acc, row, i) => {
        if (
          row[googleSheetUI.indices.orderId] === obj.Unique_ID &&
          row[googleSheetUI.indices.trackingNumber] === obj.Tracking_Number
        ) {
          acc.push(startRow + i);
        }
        return acc;
      }, []);

      // Generate PDF
      await generatePDF({
        body: obj,
        rowNumbers,
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
