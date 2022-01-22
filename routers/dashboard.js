const express = require('express')
let router = express.Router()
const db = require('quick.db')

const argon2 = require('argon2');
const {generateSession, checkSession} = require('../utils/session');

router.get("/", async(req, res) => {
    if(req.query.sessionToken) {
        if((typeof req.query.sessionToken) == "string") {
            if(checkSession(req.session.username, req.query.sessionToken)) {
                req.session.sessionToken = req.query.sessionToken;
                res.redirect("/dashboard")
            }else{
                res.redirect("/login")
            }
        }else{
            res.send(typeof req.query.sessionToken)
        }
        
    }else{
        if(checkSession(req.session.username, req.session.sessionToken)) {
            res.render("dashboard", {req:req})
        }else{
            res.redirect("/login")
        }
    }
})

module.exports = router;