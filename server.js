require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/db/db')

connectDB()

app.listen(7777,() => {
    console.log('Server is running on port 7777')
})