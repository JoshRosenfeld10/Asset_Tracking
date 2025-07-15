const express = require("express"),
  router = express.Router(),
  formatInputData = require("../utils/formatInputData"),
  googleSheetUI = require("../constants/googleSheetUI"),
  zlib = require("zlib"),
  bodyParser = require("body-parser"),
  generatePDF = require("../utils/generatePDF");

app.use(bodyParser.raw({ type: "application/gzip", limit: "10mb" }));

router.post("/", async (req, res) => {
  try {
    const { data, startRow } = JSON.parse(req.body.toString());

    // Format input data
    const formattedData = await formatInputData(data);

    for (const obj of formattedData) {
      // Compute the rows numbers that the PDF should be stored on
      const rowNumbers = data.reduce((acc, row, i) => {
        if (
          row[googleSheetUI.indices.orderId].toString().toUpperCase() ===
            obj.Unique_ID.toString().toUpperCase() &&
          row[googleSheetUI.indices.trackingNumber].toString().toUpperCase() ===
            obj.Tracking_Number.toString().toUpperCase()
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
