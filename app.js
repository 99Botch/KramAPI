// Import the dependecies required to run the API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// import the routes that contain the logic communicating with the db
const usersRoute = require('./routes/users.router');
const postsRoute = require('./routes/posts.router');

// execute express
const app = express();

// dotenv is a package used to store highly sensible information such as the database URL or token Key 
dotenv.config();

// db URI so that mongosse can connect to the server 
const URI = process.env.DB_CONNECTION;
try{
    mongoose.connect(URI, () => {
        console.log("Connection to server up and running.");
    });
} catch (err) { console.log(err)}

// Middlewares methods/functions/operations are called between processing a request and sending a response in the application method

/*Calling use(cors()) will enable the express server to respond to preflight requests (https://stackoverflow.com/questions/46024363/what-does-app-usecors-do)
A preflight request is basically an OPTION request sent to the server before the actual request is sent, in order to ask which origin and which request options the server accepts.
Basically it is a set of headers sent by the server to the browser, in other words, it makes the server accessible to any domain that requests a resource from him via a browser*/ 
app.use(cors());
// .json & .urlencoded are specifically used for POST & DELETE request, because both requests send data to the server ask if the server can accept & store the information enclose in req.body
// .json is a method inbuilt in express to recognize the incoming Request Object as a JSON Object
app.use(express.json());
// .urlencoded is a method inbuilt in express to recognize the incoming Request Object as strings or arrays, it also carries out some other functionalities like: converting form-data to JSON
app.use(express.urlencoded({ extended: true }));

// Route middlewares are functions executed when a specific route is called. Their can be as many routes as needed
// Requests concerning user data will pass /users, etc
app.use('/users', usersRoute);
app.use('/posts', postsRoute);

// specify which port (.env == DB_PORT) the app has to listen to the requests
const port = process.env.DB_PORT || 8080
app.listen(port, () => {
    console.log(`Server Up in Port ${port}`);
});

// ------------------------------------------------------------------------------------------------

// fetch('http://localhost:3000/posts')
// .then(result => {
// return result.json();
// })
// .then(data => {
// console.log(data);
// })