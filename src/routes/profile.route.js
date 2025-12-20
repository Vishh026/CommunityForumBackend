const experss = require('express')
const {userAuth} = require("../middlewares/auth.middleware")
const { getMyProfile, fetchTargetedUserProfile } = require('../controllers/profile.controller')

const router = experss.Router()

router.get('/me',userAuth,getMyProfile)

module.exports = router