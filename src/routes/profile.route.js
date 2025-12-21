const experss = require('express')
const {userAuth} = require("../middlewares/auth.middleware")
const { getMyProfile,  updateMyProfile } = require('../controllers/profile.controller')

const router = experss.Router()

router.get('/me',userAuth,getMyProfile)
router.patch('/update',userAuth,updateMyProfile)

module.exports = router