const express = require("express"),
  constants = require("./constants/constants"),
  config = require("./constants/config"),
  sheets = require("./routes/sheets"),
  generatePDFs = require("./routes/generatePDFs"),
  port = 3000 || config.port;

const app = express();

if (constants.local) app.use("/sheets", sheets);

app.use("/generatePDFs", generatePDFs);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
