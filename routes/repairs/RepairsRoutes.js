const express = require('express')

const RepairsController= require('../../controllers/repairs/RepairsController')

const router = express.Router()

router.get("/repairs", RepairsController.getAllRepairs)
router.get("/repairs/:repairId", RepairsController.getOneRepair)
router.post("/repairs", RepairsController.createRepair)
router.put("/repairs", RepairsController.updateRepair)
router.delete("/repairs/:repairId", RepairsController.deleteRepair)


module.exports = router
