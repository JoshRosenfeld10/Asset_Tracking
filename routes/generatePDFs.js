const express = require("express"),
  router = express.Router(),
  formatInputData = require("../utils/formatInputData"),
  googleSheetUI = require("../constants/googleSheetUI"),
  bodyParser = require("body-parser"),
  zlib = require("zlib"),
  generatePDF = require("../utils/generatePDF");

router.use(bodyParser.raw({ type: "application/gzip", limit: "10mb" }));

router.post("/", async (req, res) => {
  try {
    const decompressed = zlib.gunzipSync(req.body);
    const { data, startRow } = JSON.parse(decompressed.toString());

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
