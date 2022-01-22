const express = require('express')
const db = require('quick.db')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
var session = require('express-session')
const argon2 = require('argon2');
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.set('view engine', 'ejs')
app.set("views", "site/views")
app.listen(6060)
const NodeCache = require( "node-cache" );
const sessionTokens = new NodeCache();

function generateSession(username) {
  let stok =  (Math.random().toString(36) + Math.random().toString(36)).replace("0.", "").replace("0.", "");
  sessionTokens.set(stok, username);
  return stok;
}

function checkSession(username, session) {
  if(sessionTokens.get(session) == username) return true;
  return false;
}

app.post("/auth/login", async(req, res) => {
  if(!req.body.username) return res.json({error:true,message:"Username is required"});
  if(!req.body.password) return res.json({error:true,message:"Password is required"});
  if(!db.get(`hash-${req.body.username}`)) return res.json({error:true,message:"User does not exist."});
  if((await argon2.verify(db.get(`hash-${req.body.username}`), req.body.password)) === false) return res.json({error:true,message:"Incorrect password."});
  req.session.username = req.body.username;
  req.session.sessionToken = generateSession(req.body.username);
  res.redirect("/");
})
app.post("/auth/register", async(req, res) => {
  if(!req.body.username) return res.json({error:true,message:"Username is required"});
  if(!req.body.password) return res.json({error:true,message:"Password is required"});
  if(db.get(`hash-${req.body.username}`)) return res.json({error:true,message:"Username is already taken"});
  let hash = await argon2.hash(decodeURIComponent(req.body.password));
  db.set(`hash-${req.body.username}`, hash);
  db.set(`permissions-${req.body.username}`, {admin:false,user:true});
  res.json({error:false,message:"Successfully registered"});
})
app.get("/login", async (req, res) => {
    res.render("login")
})