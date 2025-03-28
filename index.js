const express = require("express"),
  constants = require("./constants/constants"),
  config = require("./constants/config"),
  sheets = require("./routes/sheets"),
  generatePDFs = require("./routes/generatePDFs"),
  upload = require("./routes/upload"),
  recreatePDF = require("./routes/recreatePDF"),
  port = config.port || 3000;

const app = express();

if (constants.local) app.use("/sheets", sheets);

app.use("/generatePDFs", generatePDFs);
app.use("/upload", upload);
app.use("/recreatePDF", recreatePDF);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
