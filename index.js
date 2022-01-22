const express = require('express')
const db = require('quick.db')
const app = express()
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

})

app.get("/login", async (req, res) => {
    
})