const express = require('express')
const { loginController, signupController, logoutController } = require('../controllers/auth.controller')


const router = express.Router()

router.post("/login",loginController)
router.post("/signup",signupController)
router.post("/logout",logoutController)

module.exports = router