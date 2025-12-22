const express = require('express')
const { userAuth, adminAuth } = require('../middlewares/auth.middleware')
const { createCommunityController,editCommunityController ,fetchCommunityByIdController, joinCommunityController} = require('../controllers/Community.controller')


const router = express.Router()

router.post("/create",userAuth,adminAuth,createCommunityController)
router.patch("/edit/:id",userAuth,adminAuth,editCommunityController)
router.get("/:communityId",userAuth,adminAuth,fetchCommunityByIdController)


router.post("/:communityId/join",userAuth,joinCommunityController)



module.exports = router