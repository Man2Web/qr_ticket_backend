const ejs = require("ejs");
const path = require("path");
const html_to_pdf = require("html-pdf-node");
const db = require("../../config/database");
const QRCode = require("qrcode");
const sharp = require("sharp");

const savePdf = async (userBookingData) => {
  const templatePath = path.join(
    __dirname,
    "../../template/email_template.ejs"
  );
  const qr_codes = [];

  const compressQRCode = async (base64Image) => {
    const buffer = Buffer.from(base64Image.split(",")[1], "base64");
    const compressedBuffer = await sharp(buffer)
      .resize(200, 200) // Resize to reduce dimensions
      .jpeg({ quality: 70 }) // Convert to JPEG with reduced quality
      .toBuffer();
    return `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;
  };

  for (const booking of userBookingData) {
    if (!booking.qr_code || typeof booking.qr_code !== "string") continue;
    try {
      const url = await QRCode.toDataURL(booking.qr_code);
      const compressedUrl = await compressQRCode(url); // Compress QR code
      qr_codes.push(compressedUrl);
    } catch (error) {
      console.error(`Error generating QR code for booking:`, error);
    }
  }
  const ticketData = await db.query("SELECT * FROM tickets WHERE id = $1", [
    userBookingData[0].ticket_id,
  ]);
  const userTicketData = ticketData.rows[0];
  const website_url = `${process.env.WEBSITE_URL}#/success/${userBookingData[0].transaction_id}`;

  const gstPercentage = 18;

  // Calculate price per ticket including GST
  const pricePerTicket = Number(userTicketData.price);
  const gstPerTicket = parseFloat(
    (pricePerTicket * (gstPercentage / 100)).toFixed(2)
  );
  const priceWithGstPerTicket = parseFloat(
    (pricePerTicket + gstPerTicket).toFixed(2)
  );

  // Multiply by the number of tickets
  const totalTickets = Number(userBookingData[0].number_of_tickets);
  const finalPrice = parseFloat(
    (priceWithGstPerTicket * totalTickets).toFixed(2)
  );

  // Render the EJS template with all required variables
  const pdf = await ejs.renderFile(templatePath, {
    userBookingData,
    userTicketData,
    qr_codes,
    website_url,
    finalPrice,
    pricePerTicket,
    gstPerTicket,
    totalTickets,
  });

  const options = {
    printBackground: false, // Avoid embedding background images if unnecessary
    preferCSSPageSize: true,
    format: "A4",
  };

  const pdfData = await html_to_pdf.generatePdf({ content: pdf }, options);
  return pdfData;
};

module.exports = savePdf;
