const ejs = require("ejs");
const path = require("path");
const html_to_pdf = require("html-pdf-node");
const db = require("../../config/database");
const QRCode = require("qrcode");

const savePdf = async (userBookingData) => {
  const templatePath = path.join(
    __dirname,
    "../../template/email_template.ejs"
  );
  const qr_codes = [];

  // Correct iteration and QR code generation
  for (const booking of userBookingData) {
    if (!booking.qr_code || typeof booking.qr_code !== "string") {
      console.error(`Invalid qr_code for booking:`, booking);
      continue;
    }
    try {
      const url = await QRCode.toDataURL(booking.qr_code);
      qr_codes.push(url);
    } catch (error) {
      console.error(
        `Error generating QR code for booking ${booking.qr_code}:`,
        error
      );
    }
  }
  const ticketData = await db.query("SELECT * FROM tickets WHERE id = $1", [
    userBookingData[0].ticket_id,
  ]);
  const userTicketData = ticketData.rows[0];
  const website_url = `${process.env.WEBSITE_URL}#/success/${userBookingData[0].transaction_id}`;

  const pdf = await ejs.renderFile(templatePath, {
    userBookingData,
    userTicketData,
    qr_codes,
    website_url,
  });
  const options = {
    printBackground: true, // prints background images
    preferCSSPageSize: true, // fits everything into a single page based on content
    format: "A4",
  };
  const pdfData = await html_to_pdf.generatePdf({ content: pdf }, options);
  return pdfData;
};

module.exports = savePdf;
