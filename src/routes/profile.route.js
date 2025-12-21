const experss = require('express')
const {userAuth} = require("../middlewares/auth.middleware")
const { getMyProfile,  updateMyProfile, fetchUserProfile } = require('../controllers/profile.controller')

const router = experss.Router()

router.get('/me',userAuth,getMyProfile)
router.patch('/update',userAuth,updateMyProfile)
router.get('/:userid',userAuth,fetchUserProfile)

module.exports = router