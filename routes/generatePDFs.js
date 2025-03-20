const express = require("express"),
  router = express.Router(),
  formatInputData = require("../utils/formatInputData"),
  google = require("../modules/google");

router.use(express.json());

router.post("/", async (req, res) => {
  const { data } = req.body;

  const formattedData = await formatInputData(data);

  // TODO: generate PDFs
  res.status(200).send(formattedData);
});

module.exports = router;
