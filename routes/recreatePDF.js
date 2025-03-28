const express = require("express"),
  router = express.Router(),
  googleSheetUI = require("../constants/googleSheetUI"),
  google = require("../modules/google"),
  formatInputDataFromTargetRow = require("../utils/formatInputDataFromTargetRow"),
  generatePDF = require("../utils/generatePDF");

router.use(express.json());

router.post("/", async (req, res) => {
  try {
    const { targetRow } = req.body;

    // Get all rows
    const { data } = await google.getSheetRange({
      spreadsheetId: googleSheetUI.masterDistroId,
      range: "MASTER DISTRO",
    });
    const allRows = data.values;
    allRows.shift();

    // Format PDF data
    const formattedData = await formatInputDataFromTargetRow(
      targetRow,
      allRows
    );

    for (const obj of formattedData) {
      // Generate PDF
      await generatePDF({
        body: obj,
        rowNumbers: obj.Used_Row_Indices,
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
