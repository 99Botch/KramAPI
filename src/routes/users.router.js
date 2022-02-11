// Import the dependecies & functions necessary to run the API - routers allows us to create routes in a specific file
const router = require('express').Router();
// import the function to check the validity of the tokens
const verify  = require('../config/tokenValidation'); 
// import UsersController from '../controllers/users.controller'
const { register, login, getUsers, getUser, updateUser, deleteUser }= require('../controllers/users.controller');
// const { prependOnceListener } = require('../models/users.model');

router.post("/register", register);
router.post("/login", login);
router.get("/", getUsers);
router.get("/:id", getUser);
router.put('/:id', verify, async function(req,res){
    await updateUser(req,res);
});
router.delete('/:id', verify, async function(req,res){
    await deleteUser(req,res);
});

module.exports = router;