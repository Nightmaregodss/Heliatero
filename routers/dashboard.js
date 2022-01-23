const express = require('express')
let router = express.Router()
const db = require('quick.db')
const axios = require('axios')
const settings = require('../settings.json');
const argon2 = require('argon2');
const { generateSession, checkSession } = require('../utils/session');

router.get("/", async(req, res) => {
    if(req.query.sessionToken) {
        if((typeof req.query.sessionToken) == "string") {
            if (checkSession(req.session.username, req.query.sessionToken)) {
                req.session.sessionToken = req.query.sessionToken;
                res.redirect("/dashboard")
            } else {
                res.redirect("/login")
            }
        } else {
            res.send(typeof req.query.sessionToken)
        }
        
    } else {
        if (checkSession(req.session.username, req.session.sessionToken)) {
            let servers = db.get(`servers-${req.session.username}`);
            if(!servers) servers = [];
            let serversetstats = [];
            for(let i = 0; i < servers.length; i++) {
                const t = await axios.get(`${settings.nodes[0].contact}/stats/${servers[i]}`);
                serversetstats.push({server:servers[i], stats:t.data});
            }
            res.render("dashboard", {req:req,servers:servers, srvstats:serversetstats});
        } else {
            res.redirect("/login")
        }
    }
})

module.exports = router;
