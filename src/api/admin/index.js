const express = require("express");
const router = express.Router();
const db = require("../../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.post("/add", async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkIfAdminExists = await db.query(
      "SELECT * FROM admins where email = $1",
      [email]
    );
    if (checkIfAdminExists.rows.length > 0)
      return res.status(404).json({ message: "Admin already exists" });
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

router.get("/auth-admin", async (req, res) => {
  const { id } = req.query;
  try {
    const userData = await db.query("SELECT * FROM admins WHERE id = $1", [id]);
    console.log();
    if (userData.rows.length === 0)
      return res.status(404).json("Invalid credentials");
    return res.status(200).json({ message: "Authenticated" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Incorrect credentials" });
  }
});

router.get("/auth-super-admin", async (req, res) => {
  const { id } = req.query;
  try {
    const userData = await db.query(
      "SELECT * FROM admins WHERE id = $1 AND super_admin = TRUE",
      [id]
    );
    if (userData.rows.length === 0)
      return res.status(404).json("Invalid credentials");
    return res.status(200).json({ message: "Authenticated" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Incorrect credentials" });
  }
});

router.get("/get-all", async (req, res) => {
  try {
    const adminData = await db.query(
      "SELECT email, id FROM admins WHERE super_admin = FALSE"
    );
    return res
      .status(200)
      .json({ adminsData: adminData.rows, message: "Admins Data" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error getting data" });
  }
});

router.delete("/remove", async (req, res) => {
  const { email, id } = req.query;
  try {
    const checkIfAdminExists = await db.query(
      "SELECT * FROM admins where email = $1",
      [email]
    );

    if (checkIfAdminExists.rows.length === 0)
      return res.status(404).json({ message: "Admin does not exist" });

    await db.query(
      "DELETE FROM admins WHERE email = $1 AND id = $2 AND super_admin = FALSE",
      [email, id]
    );
    return res.status(200).json({ message: "Admins removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Error removing admin" });
  }
});

module.exports = router;
