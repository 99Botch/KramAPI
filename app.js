// create express app
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// connect to db
mongoose.connect(process.env.DB_CONNECTION, () => {
    console.log("Connection to server up and running.");
});

// Middlewares
app.use(cors());
app.use(express.json());

// import routes
const usersRoute = require('./routes/users.router');
const postsRoute = require('./routes/posts.router');

// routes middleware ->  as you wish = user, decks, cards, etc...
app.use('/users', usersRoute);
app.use('/posts', postsRoute);

app.listen(process.env.DB_PORT);

// fetch('http://localhost:3000/posts')
// .then(result => {
// return result.json();
// })
// .then(data => {
// console.log(data);
// })