const express = require("express"),
  constants = require("./constants/constants"),
  config = require("./constants/config"),
  sheets = require("./routes/sheets"),
  port = 3000 || config.port;

const app = express();

if (constants.local) app.use("/sheets", sheets);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
