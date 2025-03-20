const googleSheetUI = require("../constants/googleSheetUI"),
  getQRCodeDataURI = require("./getQRCodeDataUri");

/**
 * Transform rows (array of arrays) into an array of objects.
 *
 * Rules:
 *  1) A row’s unique ID might have "_P#" (or "_P##") appended. If so:
 *     - baseOrderId = everything before that suffix
 *     - uniqueId = the entire string (including the suffix)
 *  2) Parts are grouped by (baseOrderId, trackingNumber). That is:
 *     - If baseOrderId and trackingNumber match, they share the same Parts.
 *     - If trackingNumber differs, they do NOT share parts (even if baseOrderId is the same).
 *  3) Each output object is keyed by (uniqueId, trackingNumber). So:
 *     - If uniqueId changes OR trackingNumber changes, we get a new output object.
 *     - That object references the shared parts from (baseOrderId, trackingNumber).
 */
const formatInputData = async (rows) => {
  // Helper to parse baseOrderId vs. uniqueId
  const parseBaseAndUniqueId = (rawUniqueId) => {
    // Look for "_P#" or "_P##" at the end
    rawUniqueId =
      typeof rawUniqueId != "string"
        ? rawUniqueId.toString().toUpperCase()
        : rawUniqueId.toUpperCase();

    const match = rawUniqueId.match(/^(.*)(_P\d{1,2})$/);
    if (match) {
      return {
        baseOrderId: match[1].toUpperCase(), // everything before _P#
        uniqueId: rawUniqueId, // full string
      };
    }
    // No suffix
    return {
      baseOrderId: rawUniqueId,
      uniqueId: rawUniqueId,
    };
  };

  // 1) We’ll store parts in partsMap keyed by (baseOrderId, trackingNumber).
  //    Example key: "baseOrderId::trackingNumber"
  //    Each entry is { [partNumber]: { Part_Description, Quantity }, ... }
  const partsMap = {};

  // 2) We’ll also store data about each final object in uniqueTrackingMap, keyed by (uniqueId, trackingNumber).
  //    Example key: "uniqueId::trackingNumber"
  //    Each value is an object with:
  //       { baseOrderId, uniqueId, trackingNumber, storeNumber, storeName, storeAddress, ... }
  const uniqueTrackingMap = {};

  for (const row of rows) {
    const rawUniqueId = row[googleSheetUI.indices.orderId];
    const { baseOrderId, uniqueId } = parseBaseAndUniqueId(rawUniqueId);

    const trackingNumber = row[googleSheetUI.indices.trackingNumber];
    const storeNumber = row[googleSheetUI.indices.storeNumber];
    const storeName = row[googleSheetUI.indices.storeName];
    const addressLine = row[googleSheetUI.indices.storeAddress];
    const city = row[googleSheetUI.indices.storeCity];
    const state = row[googleSheetUI.indices.storeState];
    const zip = row[googleSheetUI.indices.storeZip];
    const combinedStoreAddress = `${addressLine}, ${city}, ${state}, ${zip}, US`;

    // 2A) Build the key for partsMap
    const partsKey = `${baseOrderId}::${trackingNumber}`;

    // Initialize if not present
    if (!partsMap[partsKey]) {
      partsMap[partsKey] = {};
    }

    // 2B) Accumulate part data into partsMap
    const partNumber = row[googleSheetUI.indices.partNumber];
    const partDescription = row[googleSheetUI.indices.partDescription];

    if (!partsMap[partsKey][partNumber]) {
      partsMap[partsKey][partNumber] = {
        Part_Description: partDescription,
        Quantity: 1, // default 1
      };
    } else {
      partsMap[partsKey][partNumber].Quantity += 1;
    }

    // 2C) Build the key for uniqueTrackingMap (uniqueId & trackingNumber)
    const uniqueTrackingKey = `${uniqueId}::${trackingNumber}`;

    // Initialize or overwrite info for the (uniqueId, trackingNumber)
    // If a single (uniqueId, trackingNumber) appears in multiple rows, we assume consistent store data
    uniqueTrackingMap[uniqueTrackingKey] = {
      baseOrderId,
      uniqueId,
      trackingNumber,
      Store_Number: storeNumber,
      Store_Name: storeName,
      Store_Address: combinedStoreAddress,
    };
  }

  // 3) Build final array of objects
  //    For each uniqueTrackingKey => we have an object referencing the correct parts.
  //    The correct parts are found via the key (baseOrderId, trackingNumber).
  const results = [];
  for (const [uniqueTrackingKey, info] of Object.entries(uniqueTrackingMap)) {
    const { baseOrderId, uniqueId, trackingNumber } = info;

    // Rebuild the key for parts
    const partsKey = `${baseOrderId}::${trackingNumber}`;
    const partEntries = partsMap[partsKey] || {};

    // Convert the partEntries object to an array
    const partsArray = Object.entries(partEntries).map(([pNumber, pData]) => ({
      Part_Number: pNumber,
      Part_Description: pData.Part_Description,
      Quantity: String(pData.Quantity),
    }));

    results.push({
      Order_ID: baseOrderId, // base portion only
      Unique_ID: uniqueId, // full unique (with _P# if any)
      Tracking_Number: trackingNumber,
      Store_Number: info.Store_Number,
      Store_Name: info.Store_Name,
      Store_Address: info.Store_Address,
      QR_Code_URI: await getQRCodeDataURI(uniqueId),
      Parts: partsArray,
    });
  }

  // console.log(JSON.stringify(results, null, 2));
  return results;
};

const rows = [
  [
    "3",
    1,
    1,
    "Test",
    "UMPI375",
    4056,
    "Test",
    "1535 Broadway",
    "Ste 0161A",
    "New York",
    "NY",
    10036,
    "646.350.4645 RETAIL MGR",
    "Fed Ex Ground",
    241878686,
    "UMPI375",
    "Thu Jun 06 2024 00: 00: 00 GMT-0400 (Eastern Daylight Time)",
    "Delivered",
    "",
  ],
  [
    "1",
    1,
    1,
    "Test",
    "UMPI375",
    4056,
    "Test",
    "1535 Broadway",
    "Ste 0161A",
    "New York",
    "NY",
    10036,
    "646.350.4645 RETAIL MGR",
    "Fed Ex Ground",
    241878686,
    "UMPI375",
    "Thu Jun 06 2024 00: 00: 00 GMT-0400 (Eastern Daylight Time)",
    "Delivered",
    "",
  ],
  [
    "1",
    2,
    1,
    "Test",
    "UMPI375",
    4056,
    "Test",
    "1535 Broadway",
    "Ste 0161A",
    "New York",
    "NY",
    10036,
    "646.350.4645 RETAIL MGR",
    "Fed Ex Ground",
    241878686,
    "UMPI375",
    "Thu Jun 06 2024 00: 00: 00 GMT-0400 (Eastern Daylight Time)",
    "Delivered",
    "",
  ],
];

formatInputData(rows);

module.exports = formatInputData;
