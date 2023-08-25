const { seedData, getList, getStatistics, getBarCharData, getPieChartData, getAllData } = require('../controllers/transactionController')

const router = require('express').Router()

// initialized database with seed data
router.get("/", seedData)
// Get list of transaction base on search and date
router.get("/transactions", getList)
// Get Statistics
router.get("/statistics", getStatistics)
// Bar chart
router.get("/barchart", getBarCharData)
// Pie Chart
router.get("/piechart", getPieChartData)
// Get combined data
router.get("/combined-data", getAllData)


module.exports = router