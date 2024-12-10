const express = require("express");
const router = express.Router();
const db = require("../../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.post("/add", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.query("INSERT INTO admins (email, password) VALUES ($1, $2)", [
      email,
      hashedPassword,
    ]);
    return res.status(200).json({ message: "Admin added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Can not add admin" });
  }
});

router.post("/check", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userData = await db.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);
    const checkPassword = await bcrypt.compare(
      password,
      userData.rows[0].password
    );
    if (!checkPassword)
      return res.status(404).json({ message: "Incorrect credentials" });

    return res
      .status(200)
      .json({ adminId: userData.rows[0].id, message: "Logged In" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Incorrect credentials" });
  }
});

module.exports = router;
