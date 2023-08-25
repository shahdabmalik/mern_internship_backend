const axios = require('axios');
const Transaction = require('../models/transactions');
const ApiUrl = process.env.API_URL

// ---------------------------initialize the database with seed data.---------------------------
const seedData = async (req, res) => {

    try {
        await Transaction.deleteMany({})
        const { data } = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json")
        await Transaction.insertMany(data)
        res.status(200).json("Data Stored")
    } catch (error) {
        console.log(error);
    }

}

// ---------------------Get list of transaction based on search and page number---------------------
const getList = async (req, res) => {

    const { page, search, month } = req.query
    let perPage = 10

    const searchQuery = {
        $and: [
            { $expr: { $eq: [{ $month: '$dateOfSale' }, parseInt(month)] } },
            {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { price: parseFloat(search) || 0 }
                ]
            }
        ]

    }

    try {
        const totalCount = await Transaction.countDocuments(searchQuery)
        const totalPages = Math.ceil(totalCount / perPage)
        const transactions = await Transaction.find(searchQuery).skip((page - 1) * perPage).limit(perPage)
        res.status(200).json({ transactions, totalPages, currentPage: page, totalCount })
    } catch (error) {
        console.log(error);
    }
}

// ---------------------------------------Statistics Api---------------------------------------
const getStatistics = async (req, res) => {
    const { month } = req.query
    try {
        const transactions = await Transaction.find({ $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] } })
        const totalSoldItems = transactions.filter(transaction => transaction.sold === true).length
        const totalNotSoldItems = transactions.filter(transaction => transaction.sold === false).length
        const totalSaleAmount = transactions
            .filter(transactions => transactions.sold === true)
            .reduce((total, transaction) => total + transaction.price, 0)
        res.status(200).json({ totalNotSoldItems, totalSaleAmount, totalSoldItems })
    } catch (error) {
        console.log(error);
    }
}

// ----------------------------------------Bar Chart api----------------------------------------
const getBarCharData = async (req, res) => {
    const { month } = req.query

    try {
        const result = await Transaction.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $month: '$dateOfSale' }, parseInt(month)] },
                },
            },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lte: ['$price', 100] }, then: '0 - 100' },
                                { case: { $lte: ['$price', 200] }, then: '101 - 200' },
                                { case: { $lte: ['$price', 300] }, then: '201 - 300' },
                                { case: { $lte: ['$price', 400] }, then: '301 - 400' },
                                { case: { $lte: ['$price', 500] }, then: '401 - 500' },
                                { case: { $lte: ['$price', 600] }, then: '501 - 600' },
                                { case: { $lte: ['$price', 700] }, then: '601 - 700' },
                                { case: { $lte: ['$price', 800] }, then: '701 - 800' },
                                { case: { $lte: ['$price', 900] }, then: '801 - 900' },
                            ],
                            default: '901-above',
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 }
            }
        ])
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
}

// ---------------------------------------Pie chart api---------------------------------------
const getPieChartData = async (req, res) => {
    const { month } = req.query
    try {
        const result = await Transaction.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $month: '$dateOfSale' }, parseInt(month)] },
                },
            },
            {
                $group: {
                    _id: '$category', // Grouping by category
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
    }
}

// -------------------------------------Get all data api-------------------------------------
const getAllData = async (req, res) => {

    const month = parseInt(req.query.month)

    try {
        const statistics = await axios.get(`${ApiUrl}/statistics?month=${month}`);
        const barChart = await axios.get(`${ApiUrl}/barchart?month=${month}`);
        const pieChart = await axios.get(`${ApiUrl}/piechart?month=${month}`);

        const combinedData = {
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data,
        };

        res.json(combinedData);

    } catch (error) {
        console.log(error);
    }

}

module.exports = {
    seedData,
    getList,
    getStatistics,
    getBarCharData,
    getPieChartData,
    getAllData
}