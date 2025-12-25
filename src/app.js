const express = require('express')
const cookieParser = require('cookie-parser')
const authRoute = require("./routes/auth.route")
const profileRoute = require('./routes/profile.route')
const communityRoute = require('./routes/community.route')
const auditRoute = require('./routes/auditLog.route')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


app.use('/api/auth',authRoute)
app.use('/api/users',profileRoute)
app.use('/api/community',communityRoute)
app.use('/api',auditRoute)


module.exports = app