const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();

// Middleware for parsing request bodies (JSON & URL-encoded)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/financialDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Schema for Income
const incomeSchema = new mongoose.Schema({
    source: String,
    amount: Number
});

// Schema for Expense
const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true }
});

// Models
const Income = mongoose.model('Income', incomeSchema);
const Expense = mongoose.model('Expense', expenseSchema);

// Route for serving the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'income.html'));
});

// Route for adding a new income
app.post('/add-income', (req, res) => {
    const newIncome = new Income({
        source: req.body.incomeSource,
        amount: req.body.incomeAmount
    });

    newIncome.save()
        .then(() => res.json({ message: 'Income added successfully!' }))
        .catch(err => res.status(400).json({ error: err.message }));
});

// Route for retrieving all incomes
app.get('/incomes', (req, res) => {
    Income.find()
        .then(incomes => res.json(incomes))
        .catch(err => res.status(400).json({ error: err.message }));
});

// Route for adding a new expense
app.post('/add-expense', (req, res) => {
    console.log('Incoming expense data:', req.body); // Log the incoming request body

    // Validate input values
    if (!req.body.description || !req.body.amount) {
        return res.status(400).json({ error: 'Description and amount are required' });
    }

    const newExpense = new Expense({
        description: req.body.description,
        amount: Number(req.body.amount) // Convert amount to number
    });

    newExpense.save()
        .then(() => res.json({ message: 'Expense added successfully!' }))
        .catch(err => {
            console.error('Error adding expense:', err.message); // Log the error
            res.status(400).json({ error: err.message });
        });
});

// Route for retrieving all expenses
app.get('/expenses', (req, res) => {
    Expense.find()
        .then(expenses => res.json(expenses))
        .catch(err => res.status(400).json({ error: err.message }));
});

// Catch-all route for any undefined routes to serve the main page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'income.html'));
});

// Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
