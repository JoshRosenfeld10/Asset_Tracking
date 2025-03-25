const express = require("express"),
  router = express.Router(),
  axios = require("axios"),
  { buffer } = require("node:stream/consumers"),
  googleSheetUI = require("../constants/googleSheetUI"),
  google = require("../modules/google");

router.use(express.json());

/**
 * Sample Request Body
 * {
    "document": {
        "id": "fc20792c-8cfc-40da-9e58-2fa2cb95b31a",
        "created_at": "2024-07-30T18:30:19.581+02:00",
        "document_template_id": "604c5114-c884-4078-94ab-e8c72f4256af",
        "meta": "{\"_filename\":\"ULGE217 - ULGE217 Graphic Approval -  - 7/30/2024\",\"gDriveFolderId\":\"1llU0p3NPLRSjMsfjCzWR7pZzpq-BjP9F\"}",
        "payload": null,
        "status": "success",
        "updated_at": "2024-07-30T18:30:24.663+02:00",
        "xml_data": null,
        "app_id": "38f04de5-4f6f-4bf6-afe4-5df564a04729",
        "download_url": "https://pdfmonkey-store.s3.eu-west-3.amazonaws.com/production/backend/document/fc20792c-8cfc-40da-9e58-2fa2cb95b31a/ULGE217%20-%20ULGE217%20Graphic%20Approval%20-%20-%207-30-2024.pdf?response-content-disposition=attachment&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA2DEHCSJKRKT25747%2F20240730%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20240730T163038Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=383b20969ba8d667fbbbc6bb4ac4323c9bcc15573b38a97f4dd46c62fd08737c",
        "checksum": "SzSr66TnhiUnxUuDVyNmwbjB4gbxNysw",
        "failure_cause": null,
        "filename": "ULGE217 - ULGE217 Graphic Approval - - 7-30-2024.pdf",
        "preview_url": "https://preview.pdfmonkey.io/pdf/web/viewer.html?file=https%3A%2F%2Fpreview.pdfmonkey.io%2Fdocument-render%2Ffc20792c-8cfc-40da-9e58-2fa2cb95b31a%2FSzSr66TnhiUnxUuDVyNmwbjB4gbxNysw",
        "public_share_link": null
    }
}
*/
router.post("/", async (req, res) => {
  try {
    const { download_url: downloadUrl, filename } = req.body.document;
    const { gDriveFolderId, rowNumbers } = JSON.parse(req.body.document.meta);

    // Download stream of PDF
    await axios({
      url: downloadUrl,
      method: "GET",
      responseType: "stream",
    }).then(async (response) => {
      const fileBuffer = await buffer(response.data);

      // Create file in Google Drive
      const data = await google.createFile({
        driveId: gDriveFolderId,
        fileName: filename,
        fileBuffer,
      });

      const { id: fileId } = data.data;

      // Update file permissions to be accessible to anyone
      await google.insertVisibleToAnyonePermission({
        fileId,
      });

      console.log(
        `${filename} upload to Google Drive (Folder ID: ${gDriveFolderId}).`
      );

      // Insert doc link to all rows corresponding to the downloaded PDF
      await google.batchUpdate({
        spreadsheetId: googleSheetUI.masterDistroId,
        data: rowNumbers.map((rowNumber) => ({
          range: `'MASTER DISTRO'!E${rowNumber}:E${rowNumber}`,
          majorDimension: "ROWS",
          values: [[`https://drive.google.com/file/d/${fileId}/view`]],
        })),
      });

      console.log(
        `${filename} document link successfully inserted in the Master Distro sheet.`
      );

      res.sendStatus(200);
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
