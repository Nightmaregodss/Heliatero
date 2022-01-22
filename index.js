const express = require('express')
const db = require('quick.db')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
var session = require('express-session')
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.listen(6060)

app.post("/auth/login", async(req, res) => {
  if(!req.body.username) return res.json({error:true,message:"Username is required"});
  if(!req.body.password) return res.json({error:true,message:"Password is required"});
})

app.get("/login", async (req, res) => {
    
})