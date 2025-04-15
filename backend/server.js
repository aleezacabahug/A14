const express = require('express');
const bodyParser = require('body-parser');
const { expressjwt } = require('express-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000; // Change backend port to 3000

// Serve Angular frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));

// Fallback route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
});

// Use your name as the secret key
const secretKey = "Aleeza";

console.log('Server is starting...');

// Middleware
app.use(bodyParser.json());
app.use(cors());

// JWT Middleware
const jwtMiddleware1 = expressjwt({
    secret: secretKey,
    algorithms: ['HS256'],
}).unless({ path: ['/api/login'] }); // Allow login route without JWT

const jwtMiddleware = expressjwt({
    secret: secretKey,
    algorithms: ['HS256'],
}).unless({
    path: [
        '/api/login', // Allow login route without JWT
        { url: /^\/api\/.*/, methods: ['GET'] }, // Allow GET requests to API routes
        { url: /^\/.*$/, methods: ['GET'] }, // Allow all static file requests
    ],
});

app.use(jwtMiddleware);

// CORS Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/b01', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', userSchema);

// Seed a test user
const seedUser = async () => {
    try {
        const existingUser = await User.findOne({ username: 'Aleeza' });
        if (existingUser) {
            console.log('User already exists');
        } else {
            const hashedPassword = bcrypt.hashSync('password', 10);
            const newUser = new User({ username: 'Ben', password: hashedPassword });
            await newUser.save();
            console.log('User added');
        }
    } catch (err) {
        console.error('Error seeding user:', err);
    }
};

// Call the function to seed the user
seedUser();

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '7d' });
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Authentication failed. Invalid username or password.' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Protected Routes
app.get('/api/dashboard', (req, res) => {
    res.json({
        success: true,
        text: 'Secret content that only logged-in users can see',
    });
});

app.get('/api/summary-chart-data', (req, res) => {
    const chartData = [
        { category: 'Finance', value: 3 },
        { category: 'Mathematics', value: 5 },
        { category: 'Computer Science', value: 11 },
        { category: 'Engineering Technology', value: 19 },
        { category: 'Health Professions', value: 17 },
    ];
    res.json(chartData);
});

app.get('/api/reports-chart-data', (req, res) => {
    const chartData = [
        { category: 'African American', value: 31 },
        { category: 'Asian American', value: 19 },
        { category: 'Latin', value: 25 },
    ];
    res.json(chartData);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ success: false, message: 'Unauthorized access' });
    } else {
        next(err);
    }
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});