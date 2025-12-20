const express = require('express')
const { loginController, signupController, logoutController, getLoggedInUserController } = require('../controllers/auth.controller')
const { userAuth } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post("/login",loginController)
router.post("/signup",signupController)
router.post("/logout",logoutController)
router.get("/me",userAuth,getLoggedInUserController)

module.exports = router