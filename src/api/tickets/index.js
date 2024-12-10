const express = require("express");
const router = express();
const db = require("../../config/database");

router.get("/", async (req, res) => {
  try {
    const tickets = await db.query("SELECT * FROM tickets");
    return res.status(200).json({ tickets: tickets.rows });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error getting tickets" });
  }
});

router.get("/get", async (req, res) => {
  const { id } = req.query;
  try {
    const ticket = await db.query("SELECT * FROM tickets WHERE id = $1", [id]);
    return res.status(200).json({ ticket: ticket.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error getting ticket details" });
  }
});

router.get("/details", async (req, res) => {
  const { id } = req.query;
  try {
    const ticketData = await db.query(
      "SELECT * FROM qr_codes RIGHT JOIN bookings ON qr_codes.booking_id = bookings.id WHERE qr_code = $1",
      [id]
    );
    if (ticketData.rows.length === 0)
      return res.status(404).json({ message: "Invalid ticket" });
    return res
      .status(200)
      .json({ ticketData: ticketData.rows[0], message: "Ticket found" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error getting ticket details" });
  }
});

router.get("/tickets-data", async (req, res) => {
  const { id } = req.query;
  try {
    const ticketData = await db.query(
      "SELECT qr_codes.*, bookings.* FROM qr_codes RIGHT JOIN bookings ON qr_codes.booking_id = bookings.id WHERE qr_codes.transaction_id = $1",
      [id]
    );
    if (ticketData.rows.length === 0)
      return res.status(404).json({ message: "Invalid ticket" });
    return res
      .status(200)
      .json({ ticketData: ticketData.rows, message: "Ticket found" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error getting ticket details" });
  }
});

router.put("/check-in", async (req, res) => {
  const { transaction_id, qr_code } = req.body;
  try {
    await db.query(
      "UPDATE qr_codes SET checked_in = TRUE WHERE transaction_id = $1 AND qr_code = $2",
      [transaction_id, qr_code]
    );
    return res.status(200).json({ message: "Ticket checked-in" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error check-in user" });
  }
});

module.exports = router;
