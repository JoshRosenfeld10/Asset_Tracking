const config = require("./config");

module.exports = {
  indices: {
    orderId: 0,
    partNumber: 1,
    trackingNumber: 2,
    partDescription: 3,
    jobNumber: 5,
    gDriveFolderId: 6,
    storeNumber: 7,
    storeName: 8,
    storeAddress: 9,
    storeCity: 11,
    storeState: 12,
    storeZip: 13,
  },
  masterDistroId: config.masterDistroId,
};
