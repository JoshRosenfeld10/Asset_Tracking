const express = require("express"),
  constants = require("./constants/constants"),
  config = require("./constants/config"),
  sheets = require("./routes/sheets"),
  generatePDFs = require("./routes/generatePDFs"),
  upload = require("./routes/upload"),
  recreatePDF = require("./routes/recreatePDF"),
  bodyParser = require("body-parser"),
  port = config.port || 3000;

const app = express();
app.use(bodyParser.raw({ type: "application/gzip", limit: "10mb" }));

if (constants.local) app.use("/sheets", sheets);

app.use("/generatePDFs", generatePDFs);
app.use("/upload", upload);
app.use("/recreatePDF", recreatePDF);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
