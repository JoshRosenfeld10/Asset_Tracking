const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT,
  googleAuth: {
    type: "authorized_user",
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
  pdfMonkeyToken: process.env.PDFMONKEY_ACCESS_TOKEN,
  masterDistroId: process.env.MASTER_DISTRO_ID,
};
