const googleSheetUI = require("../constants/googleSheetUI"),
  getQRCodeDataURI = require("./getQRCodeDataUri");

const formatInputDataFromTargetRow = async (targetRow, allRows) => {
  // Helper to parse baseOrderId vs. uniqueId
  function parseBaseAndUniqueId(rawUniqueId) {
    // Ensure it's a string in uppercase
    rawUniqueId =
      typeof rawUniqueId !== "string"
        ? String(rawUniqueId).toUpperCase()
        : rawUniqueId.toUpperCase();

    // Match any "_P#" or "_P##" suffix
    const match = rawUniqueId.match(/^(.*)(_P\d{1,2})$/);
    if (match) {
      return {
        baseOrderId: match[1], // everything before _P#
        uniqueId: rawUniqueId, // full string
      };
    }
    // No suffix => both are the same
    return {
      baseOrderId: rawUniqueId,
      uniqueId: rawUniqueId,
    };
  }

  // Parse the target row's unique ID & tracking number
  const targetRawUniqueId = targetRow[googleSheetUI.indices.orderId];
  const targetTrackingNumber = targetRow[googleSheetUI.indices.trackingNumber];

  const { baseOrderId: targetBaseOrderId } =
    parseBaseAndUniqueId(targetRawUniqueId);

  // Gather rows that match both targetBaseOrderId AND targetTrackingNumber
  const matchingRows = []; // will store { rowData, rowIndex }
  allRows.forEach((row, idx) => {
    const rawId = row[googleSheetUI.indices.orderId];
    if (!rawId) return;

    const { baseOrderId } = parseBaseAndUniqueId(rawId);
    const thisTrackingNumber = row[googleSheetUI.indices.trackingNumber];

    if (
      baseOrderId.toString().toUpperCase() ===
        targetBaseOrderId.toString().toUpperCase() &&
      thisTrackingNumber.toString().toUpperCase() ===
        targetTrackingNumber.toString().toUpperCase()
    ) {
      matchingRows.push({ row, idx: idx + 2 });
    }
  });

  // We'll store parts in partsMap keyed by (baseOrderId::trackingNumber)
  // and details in uniqueTrackingMap keyed by (uniqueId::trackingNumber).
  // Each entry in uniqueTrackingMap also holds an array of row indices.
  const partsMap = {}; // { [key: string]: { [partNumber: string]: { Part_Description, Quantity } } }
  const uniqueTrackingMap = {}; // { [key: string]: { baseOrderId, uniqueId, trackingNumber, ..., rowIndices: number[] } }

  for (const { row, idx } of matchingRows) {
    const rawUniqueId = row[googleSheetUI.indices.orderId];
    const { baseOrderId, uniqueId } = parseBaseAndUniqueId(rawUniqueId);

    const storeNumber = row[googleSheetUI.indices.storeNumber];
    const storeName = row[googleSheetUI.indices.storeName];
    const addressLine = row[googleSheetUI.indices.storeAddress];
    const city = row[googleSheetUI.indices.storeCity];
    const state = row[googleSheetUI.indices.storeState];
    const zip = row[googleSheetUI.indices.storeZip];
    const gDriveFolderId = row[googleSheetUI.indices.gDriveFolderId];

    const combinedStoreAddress = `${addressLine}, ${city}, ${state}, ${zip}, US`;

    // Build the partsMap key => "baseOrderId::trackingNumber"
    const partsKey = `${baseOrderId}::${targetTrackingNumber}`;
    if (!partsMap[partsKey]) {
      partsMap[partsKey] = {};
    }

    const partNumber = row[googleSheetUI.indices.partNumber];
    const partDescription = row[googleSheetUI.indices.partDescription];

    if (!partsMap[partsKey][partNumber]) {
      partsMap[partsKey][partNumber] = {
        Part_Description: partDescription,
        Quantity: 1,
      };
    } else {
      partsMap[partsKey][partNumber].Quantity += 1;
    }

    // Build the uniqueTrackingKey => "uniqueId::trackingNumber"
    const uniqueTrackingKey = `${uniqueId}::${targetTrackingNumber}`;
    if (!uniqueTrackingMap[uniqueTrackingKey]) {
      uniqueTrackingMap[uniqueTrackingKey] = {
        baseOrderId,
        uniqueId,
        trackingNumber: targetTrackingNumber,
        Store_Number: storeNumber,
        Store_Name: storeName,
        Store_Address: combinedStoreAddress,
        gDriveFolderId,
        rowIndices: [],
      };
    }

    // Record this row index in that uniqueId/trackingNumber's array
    uniqueTrackingMap[uniqueTrackingKey].rowIndices.push(idx);
  }

  // Build the final array of objects
  const results = [];
  for (const [uniqueTrackingKey, info] of Object.entries(uniqueTrackingMap)) {
    const { baseOrderId, uniqueId, trackingNumber, rowIndices } = info;

    // Only one trackingNumber, but we remain consistent
    const partsKey = `${baseOrderId}::${trackingNumber}`;
    const partEntries = partsMap[partsKey] || {};

    const partsArray = Object.entries(partEntries).map(([pNumber, pData]) => ({
      Part_Number: pNumber,
      Part_Description: pData.Part_Description,
      Quantity: String(pData.Quantity),
    }));

    results.push({
      Order_ID: baseOrderId,
      Unique_ID: uniqueId,
      Tracking_Number: trackingNumber,
      Store_Number: info.Store_Number,
      Store_Name: info.Store_Name,
      Store_Address: info.Store_Address,
      GDrive_Folder_ID: info.gDriveFolderId,
      QR_Code_URI: await getQRCodeDataURI(uniqueId),
      Parts: partsArray,
      Used_Row_Indices: rowIndices, // attach the specific row indices here
    });
  }

  return results;
};

module.exports = formatInputDataFromTargetRow;
