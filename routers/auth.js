const express = require('express')
let router = express.Router()
const db = require('quick.db')

const argon2 = require('argon2');
const {generateSession, checkSession} = require('../utils/session');

router.post("/login", async(req, res) => {
  if (typeof req.body.username !== "string") return res.json({ error: true, message: "Username is required" });
  if (typeof req.body.password !== "string") return res.json({ error: true, message:"Password is required" });
  if (!db.get(`hash-${req.body.username}`)) return res.json({ error: true, message: "User does not exist." });
  if ((await argon2.verify(db.get(`hash-${req.body.username}`), req.body.password)) === false) return res.json({error:true,message:"Incorrect password."});
  req.session.username = req.body.username;
  req.session.sessionToken = generateSession(req.body.username);
  res.json({ error: false, token: req.session.sessionToken });
});

router.post("/register", async(req, res) => {
  if (typeof req.body.username !== "string") return res.json({ error: true, message: "Username is required"});
  if (typeof req.body.password !== "string") return res.json({ error: true, message: "Password is required"});
  if (db.get(`hash-${req.body.username}`)) return res.json({ error: true, message: "Username is already taken"});
  let hash = await argon2.hash(decodeURIComponent(req.body.password));
  db.set(`hash-${req.body.username}`, hash);
  db.set(`permissions-${req.body.username}`, { admin: false, user: true });
  res.json({ error: false, message: "Successfully registered" });
});

router.get("/", async(req, res) => {
  res.send("Authetication Endpoint Reached")
});

module.exports = router;