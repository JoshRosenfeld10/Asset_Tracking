const express = require("express"),
  router = express.Router(),
  googleSheetUI = require("../constants/googleSheetUI"),
  google = require("../modules/google");

router.use(express.json());

router.get("/:id", async (req, res) => {
  const sheet = await google.getSheet({ spreadsheetId: req.params.id });
  res.send(sheet.data);
});

router.get("/:id/range", async (req, res) => {
  const sheet = await google.getSheetRange({
    spreadsheetId: req.params.id,
    range: "2:2",
  });
  res.send(sheet.data);
});

module.exports = router;
