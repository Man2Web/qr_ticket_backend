const express = require("express");
const router = express();
const db = require("../../config/database");
const savePdf = require("../services/savePdf");
const { nanoid } = require("nanoid");
const sendMessage = require("../services/sendMessage");
const sendWhatsapp = require("../services/sendWhatsapp");

router.get("/", async (req, res) => {
  try {
    const tickets = await db.query(
      "SELECT * FROM tickets WHERE deleted = FALSE"
    );
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

router.get("/download", async (req, res) => {
  const { id } = req.query;
  try {
    const ticketData = await db.query(
      "SELECT qr_codes.*, bookings.* FROM qr_codes RIGHT JOIN bookings ON qr_codes.booking_id = bookings.id WHERE qr_codes.transaction_id = $1",
      [id]
    );
    if (ticketData.rows.length === 0)
      return res.status(404).json({ message: "Invalid booking id" });

    const pdfBuffer = await savePdf(ticketData.rows);

    // console.log(ticketData.rows);
    // Set headers for PDF response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="booking-confirmation.pdf"',
      "Content-Length": pdfBuffer.length, // Set the correct content length
    });

    // Send the PDF buffer as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error check-in user" });
  }
});

router.get("/view/pdf", async (req, res) => {
  const { id } = req.query;
  try {
    const ticketData = await db.query(
      "SELECT qr_codes.*, bookings.* FROM qr_codes RIGHT JOIN bookings ON qr_codes.booking_id = bookings.id WHERE qr_codes.transaction_id = $1",
      [id]
    );
    if (ticketData.rows.length === 0)
      return res.status(404).json({ message: "Invalid booking id" });

    const pdfBuffer = await savePdf(ticketData.rows);

    // console.log(ticketData.rows);
    // Set headers for PDF response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="booking-confirmation.pdf"',
      "Content-Length": pdfBuffer.length, // Set the correct content length
    });

    // Send the PDF buffer as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error check-in user" });
  }
});

router.post("/add-ticket", async (req, res) => {
  const { name, description, price, number_of_tickets, keyPoints } = req.body;
  try {
    await db.query(
      "INSERT INTO tickets (name, description, points, price, tickets_left) VALUES($1, $2, $3, $4, $5)",
      [name, description, keyPoints, price, number_of_tickets]
    );
    return res.status(200).json({ message: "Ticket added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error adding ticket" });
  }
});

router.put("/edit-ticket", async (req, res) => {
  const { name, description, price, number_of_tickets, keyPoints, status, id } =
    req.body;
  try {
    await db.query(
      "UPDATE tickets SET name = $1, description = $2, points = $3, price = $4, tickets_left = $5, status = $6 WHERE id = $7",
      [name, description, keyPoints, price, number_of_tickets, status, id]
    );
    return res.status(200).json({ message: "Ticket updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error updating ticket" });
  }
});

router.post("/booking", async (req, res) => {
  const { ticketId, number_of_tickets, name, phone_number } = req.body;
  try {
    const checkTicket = await db.query("SELECT * FROM tickets WHERE id = $1", [
      ticketId,
    ]);
    if (!checkTicket.rows[0].status) {
      return res.status(404).json({ message: "Ticket status inactive" });
    } else if (
      Number(number_of_tickets) > Number(checkTicket.rows[0].tickets_left)
    ) {
      return res.status(404).json({
        message: `Selected tickets is more than available tickets, Available tickets ${checkTicket.rows[0].tickets_left}`,
      });
    }
    const nanoId = nanoid(6);
    const id = await db.query(
      "INSERT INTO bookings (fName, phone_number, ticket_id, number_of_tickets, transaction_id, status) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING id",
      [name, phone_number, ticketId, number_of_tickets, nanoId]
    );
    await sendMessage(phone_number, nanoId);
    await sendWhatsapp(phone_number, nanoId);
    for (let i = 0; i < number_of_tickets; i++) {
      const link = nanoid(6);
      await db.query(
        "INSERT INTO qr_codes (booking_id, transaction_id, ticket_id, qr_code, checked_in) VALUES ($1, $2, $3, $4, FALSE)",
        [id.rows[0].id, nanoId, ticketId, link]
      );
    }
    return res.status(200).json({ message: "Booking successful" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Could not process booking" });
  }
});

router.delete("/delete", async (req, res) => {
  const { id } = req.query;
  try {
    await db.query("UPDATE tickets SET deleted = TRUE WHERE id = $1", [id]);
    return res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Could not delete ticket" });
  }
});

module.exports = router;
