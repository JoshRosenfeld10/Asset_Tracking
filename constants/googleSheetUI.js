const config = require("./config");

module.exports = {
  indices: {
    orderId: 0,
    partNumber: 1,
    trackingNumber: 2,
    partDescription: 3,
    jobNumber: 4,
    storeNumber: 5,
    storeName: 6,
    storeAddress: 7,
    storeCity: 9,
    storeState: 10,
    storeZip: 11,
  },
  masterDistroId: config.masterDistroId,
};
