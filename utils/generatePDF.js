const constants = require("../constants/constants"),
  pdfMonkey = require("../constants/pdfMonkey");

const generatePDF = async ({ body, rowNumbers }) => {
  try {
    await fetch("https://api.pdfmonkey.io/api/v1/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${constants.pdfMonkeyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document: {
          document_template_id: pdfMonkey.assetTrackingPackingSlipTemplateId,
          status: "pending",
          payload: body,
          meta: {
            _filename: body["fileName"],
            gDriveFolderId: body["gdriveFolderId"],
            rowNumbers,
          },
        },
      }),
    });

    console.log(`QC Inspection Report PDF generated successfully.`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = generatePDF;
