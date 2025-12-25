const express = require('express')
const { userAuth, adminAuth } = require('../middlewares/auth.middleware')
const {getAuditLogsController} = require('../controllers/getAuditLogs.Controller')

const router = express.Router()

router.get('/audit-logs',userAuth,adminAuth,getAuditLogsController)

module.exports = router;
