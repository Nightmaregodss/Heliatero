const express = require('express')
const db = require('quick.db')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(cors({
    origin:['http://localhost:6060'],
    methods:['GET','POST'],
    credentials: true // enable set cookie
}));
app.use(bodyParser.json())
var session = require('express-session')
const fs = require('fs')
const argon2 = require('argon2');
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.set('view engine', 'ejs')
app.set("views", "site/views")
app.listen(6060);
require('./utils/session');

let allrouters = fs.readdirSync('./routers').filter(file => file.endsWith('.js'));

for(let i = 0; i < allrouters.length; i++) {
  let router = require('./routers/' + allrouters[i]);
  app.use('/' + allrouters[i].replace('.js', ''), router);
  console.log("[ROUTING] Loaded router /" + allrouters[i].replace('.js', ''))
}

app.get("/login", async (req, res) => {
    res.render("login")
})

module.exports = {app:app}