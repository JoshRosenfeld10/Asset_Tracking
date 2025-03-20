const imgToBase64 = require("image-to-base64");

const getQRCodeDataUri = async (orderId) => {
  const URL = `http://api.qrserver.com/v1/create-qr-code/?data=${orderId}&size=150x150`;

  try {
    const res = await imgToBase64(`${URL}`);
    return "data:image/png;base64," + res;
  } catch (error) {
    console.error(error);
  }
};

module.exports = getQRCodeDataUri;
