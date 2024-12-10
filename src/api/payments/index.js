const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const { nanoid } = require("nanoid");
const router = express.Router();
const db = require("../../config/database");
const QRCode = require("qrcode");

router.post("/", async (req, res) => {
  const { fName, phoneNumber, ticketId, numberOfTickets } =
    req.body.paymentData;
  const checkTicket = await db.query("SELECT * FROM tickets WHERE id = $1", [
    ticketId,
  ]);
  if (!checkTicket.rows[0].status) {
    return res.status(404).json({ message: "Could not process booking" });
  } else if (numberOfTickets > checkTicket.rows[0].tickets_left) {
    return res
      .status(404)
      .json({ message: "Selected tickets is more than available tickets" });
  }
  const nanoId = nanoid();
  const demo_merchant_Id = process.env.MERCHANT_ID;
  const demo_salt_key = process.env.SALT_KEY;

  await db.query(
    "INSERT INTO bookings (fName, phone_number, ticket_id, number_of_tickets, transaction_id, status) VALUES ($1, $2, $3, $4, $5, FALSE)",
    [fName, phoneNumber, ticketId, numberOfTickets, nanoId]
  );

  const data = {
    merchantId: demo_merchant_Id,
    merchantTransactionId: nanoId,
    merchantUserId: nanoId,
    name: fName,
    amount: 1000 * 100,
    redirectUrl: `${process.env.BACKEND_URL}payments/status/?tId=${nanoId}`,
    redirectMode: "POST",
    mobileNumber: phoneNumber,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payload = JSON.stringify(data);
  const payloadMain = Buffer.from(payload).toString("base64");

  const keyIndex = 1;
  const stringToHash = payloadMain + "/pg/v1/pay" + demo_salt_key;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    "X-VERIFY": checksum,
  };

  const userRequestedData = {
    fName,
    phoneNumber,
  };

  const requestData = {
    request: payloadMain,
    requestedBookingDetails: userRequestedData,
  };

  try {
    const response = await axios.post(prod_URL, requestData, { headers });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/status", async (req, res) => {
  const { tId } = req.query;
  const merchantId = process.env.MERCHANT_ID;
  const keyIndex = 1;
  const string = `/pg/v1/status/${merchantId}/${tId}` + process.env.SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${tId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };
  try {
    const response = await axios.request(options);
    if (!response.data.success) {
      // Here we need to redirect the user incase of a failed transaction
      return res.redirect(`${process.env.WEBSITE_URL}#/failed`);
    }
    const bookingDetails = await db.query(
      "UPDATE bookings SET status = TRUE WHERE transaction_id = $1 RETURNING *",
      [tId]
    );
    const { id, ticket_id, transaction_id, number_of_tickets } =
      bookingDetails.rows[0];
    for (let i = 0; i < number_of_tickets; i++) {
      const link = nanoid();
      // QR Generation
      QRCode.toString(link, { type: "terminal" }, function (err, url) {
        console.log(url);
      });

      await db.query(
        "INSERT INTO qr_codes (booking_id, transaction_id, ticket_id, qr_code, checked_in) VALUES ($1, $2, $3, $4, FALSE)",
        [id, transaction_id, ticket_id, link]
      );
    }
    return res.redirect(`${process.env.WEBSITE_URL}#/success/${tId}`);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
