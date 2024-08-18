const express = require('express');
const router = express.Router();

// Mock Database for Users (replace with real DB later)
let users = [{ username: 'super', password: '123', role: 'SuperAdmin' }];

// User Login Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.status(200).json({ message: 'Login successful', user });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// User Registration Route
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }
    const newUser = { username, password, role: 'User' };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

module.exports = router;
