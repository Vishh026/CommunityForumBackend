const express = require('express')
const { userAuth, adminAuth } = require('../middlewares/auth.middleware')
const { createCommunityController,editCommunityController } = require('../controllers/Community.controller')

const router = express.Router()

router.post("/create",userAuth,adminAuth,createCommunityController)
router.patch("/edit/:id",userAuth,adminAuth,editCommunityController)


module.exports = router