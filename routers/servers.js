const express = require('express');
const req = require('express/lib/request');
const router = express.Router()
const db = require('quick.db');
const axios = require('axios');
const settings = require('../settings.json');
const { generateSession, checkSession } = require('../utils/session');
const { WebSocket } = require("ws");

router.post("/create", async (req, res) => {
    let nodecontact = settings.nodes[0].contact;
    let nodepass = settings.nodes[0].password;
    let foruser = req.body.username;
    let image = req.body.image;
    if(!image) return res.json({error:true,message:"Image is required"});
    let port = req.body.port;
    if(!port) return res.json({error:true,message:"Port is required"});
    if(!foruser) return res.json({error:true,message:"Username is required"});
    if(req.body.password !== nodepass) return res.json({error:true,message:"Incorrect password"});
    axios.post(`${nodecontact}/servers/create`, {"port":parseInt(port),"image":image,"username":"test","password":"password"}).then(resp => {
        console.log(JSON.stringify(resp.data));
        if(resp.data.error) return res.json({error:true,message:resp.data.message});
        let servers = db.get(`servers-${foruser}`);
        if(!servers) servers = [];
        servers.push(resp.data.id);
        db.set(`servers-${foruser}`, servers);
        res.json({error:false,message:"Successfully created server"});
    })
})

router.get("/list", async (req, res) => {
    if (checkSession(req.session.username, req.session.sessionToken)) {
        let servers = db.get(`servers-${req.session.username}`);
        if(!servers) servers = [];
        res.send(servers);
    } else {
        res.json({ error: true, message: "Not logged in." });
    }
});

router.get("/:id", async(req, res) => {
    if (checkSession(req.session.username, req.session.sessionToken)) {
        let servers = db.get(`servers-${req.session.username}`);
        if(!servers) servers = [];
        if(!servers.includes(`${req.params.id}`)) return res.redirect("/dashboard");
        const t = await axios.get(`${settings.nodes[0].contact}/stats/${req.params.id}`);
        res.render("console", {req:req, id:req.params.id,stats:t.data});
    } else {
        res.json({ error: true, message: "Not logged in." });
    }
})

router.get("/power/start/:id", async(req, res) => {
    if (checkSession(req.session.username, req.session.sessionToken)) {
        let servers = db.get(`servers-${req.session.username}`);
        if(!servers) servers = [];
        if(!servers.includes(`${req.params.id}`)) return res.redirect("/dashboard");
        const t = await axios.get(`${settings.nodes[0].contact}/power/start/${req.params.id}`);
        res.json(t.data)
    } else {
        res.json({ error: true, message: "Not logged in." });
    }
})
router.get("/power/stop/:id", async(req, res) => {
    if (checkSession(req.session.username, req.session.sessionToken)) {
        let servers = db.get(`servers-${req.session.username}`);
        if(!servers) servers = [];
        if(!servers.includes(`${req.params.id}`)) return res.redirect("/dashboard");
        const t = await axios.get(`${settings.nodes[0].contact}/power/stop/${req.params.id}`);
        res.json(t.data)
    } else {
        res.json({ error: true, message: "Not logged in." });
    }
})

router.get("/power/restart/:id", async(req, res) => {
    if (checkSession(req.session.username, req.session.sessionToken)) {
        let servers = db.get(`servers-${req.session.username}`);
        if(!servers) servers = [];
        if(!servers.includes(`${req.params.id}`)) return res.redirect("/dashboard");
        const t = await axios.get(`${settings.nodes[0].contact}/power/restart/${req.params.id}`);
        res.json(t.data)
    } else {
        res.json({ error: true, message: "Not logged in." });
    }
})


router.ws("/console/:id", (ws, req) => {
    let { id } = req.params;
    let open = false;

    console.log(settings.nodes[0].contact.replace("http://", "").replace("https://", ""))
    const client_ws = new WebSocket(`ws://${settings.nodes[0].contact.replace("http://", "").replace("https://", "")}/servers/console/${id}`);

    client_ws.on('open', () => {
        console.log('connected');
        open = true;
    });
      
    client_ws.on('message', data => {
        if((JSON.parse(data).data) !== undefined) {
        ws.send(JSON.stringify({message:(JSON.parse(data).data).toString()}));
        }
    });
      
    client_ws.on('close', () => {
        console.log('disconnected');
        open = false;
        ws.close();
    });
    
    ws.on('message', msg => {
        client_ws.send(JSON.stringify({ command: msg }));
    });

    ws.onclose = () => {
        if (open) client_ws.close();
    };
})

module.exports = router;

