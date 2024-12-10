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

module.exports = router;
