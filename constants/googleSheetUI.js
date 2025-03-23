const config = require("./config");

module.exports = {
  indices: {
    orderId: 0,
    partNumber: 1,
    trackingNumber: 2,
    partDescription: 3,
    jobNumber: 4,
    gDriveFolderId: 5,
    storeNumber: 6,
    storeName: 7,
    storeAddress: 8,
    storeCity: 10,
    storeState: 11,
    storeZip: 12,
  },
  masterDistroId: config.masterDistroId,
};
