const express = require('express')
const cookieParser = require('cookie-parser')
const authRoute = require("./routes/auth.route")
const profileRoute = require('./routes/profile.route')

const app = express()


app.use(express.json())
app.use(cookieParser())


// routes
app.use('/api/auth',authRoute)
app.use('/api/users',profileRoute)

module.exports = app