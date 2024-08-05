const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./model/user.js');
const app = express();
// Change to your preferred port
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const config = require("./config/index.js")
const session = require('express-session');
const port = config.PORT||3000; 
// Middleware to parse JSON and URL-encoded data
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.set("view engine","ejs")
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'Songs' directory
app.use('/Songs', express.static(path.join(__dirname, 'Songs')));

// Serve static files from the 'Thumbnail' directory
app.use('/Thumbnail', express.static(path.join(__dirname, 'Thumbnail')));

app.use(session({
    secret: config.SECRET_ACCESS_TOKEN, // Use your secret token here
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
  }));
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL||"mongodb://localhost:27017/User")
    .then(() => console.log('Server connected'))
    .catch(err => console.error('Server connection error:', err));

// Endpoint to get list of MP3 files
app.get('/api/songs', (req, res) => {
    const songsDir = path.join(__dirname, 'Songs');
    fs.readdir(songsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        const mp3Files = files.filter(file => file.endsWith('.mp3'));
        res.json(mp3Files);
    });
});

// Sign-in route
app.get('/signin', (req, res) => {
    res.render('signin')
});
let name = ""
app.post('/signin', async (req, res) => {
    try {
        const { email, username, pass, confirm } = req.body;
        if (pass !== confirm) {
            return res.status(400).send(username,pass);
        }
        
        const hashedPassword = await bcrypt.hash(pass, 10); // Hash the password before storing
        await User.create({
            username: username,
            password: hashedPassword
        });
        name=username
        res.render('index',{dis:"show",shows:"display",image:"profile.png",Name:username}); // Redirect to the home page or another page after successful sign-in
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login route
app.get('/login', (req, res) => {
    res.render('login')
});

app.post('/login', async (req, res) => {
    try {
        const { username, pass } = req.body;
        const user = await User.findOne({username:username});
        if (user && await bcrypt.compare(pass, user.password)) {
            res.render('index',{dis:"show",shows:"display",image:"profile.png",Name:username}); // Redirect to the home page or another page after successful login
        } else {
            res.status(401).send('Invalid email or password');
        }
        name=username
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to get list of JPEG thumbnails
app.get('/api/thumbnails', (req, res) => {
    const thumbsDir = path.join(__dirname, 'Thumbnail');
    fs.readdir(thumbsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        const jpegFiles = files.filter(file => file.endsWith('.jpeg'));
        res.json(jpegFiles);
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to logout');
      }
      res.render('index',{dis:"display",shows:"show",image:"profile.png",Name:''}); // Redirect to the home page after logout
    });
  });
app.get('/delete', async (req, res) => {
    await User.deleteMany({username:name})
    console.log("deleted")
    res.render('index',{dis:"display",shows:"show",image:"profile.png",Name:''}); 
});
// Route for the home page
app.get('/', (req, res) => {
    res.render('index',{dis:"",shows:"",image:"profile.png",Name:''});
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
