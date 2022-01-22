const express = require('express')
let router = express.Router()
const db = require('quick.db')

const argon2 = require('argon2');
const {generateSession, checkSession} = require('../utils/session');

router.get("/", async(req, res) => {
    res.render("")
})

module.exports = router;