// Import the dependecies & functions necessary to run the API - routers allows us to create routes in a specific file
const router = require('express').Router();
// import the function to check the validity of the tokens
const verify  = require('../config/tokenValidation'); 
// import UsersController from '../controllers/users.controller'
const { register, login, getUsers, getUser, updateUser, deleteUser }= require('../controllers/users.controller');
// const { prependOnceListener } = require('../models/users.model');

/* Each URI is unique and refers to a certain function. For example, if the URI /users/register is triggered, then the application knows that the request is a post method and the response
// awaited will be process by the register function in the Users class from users.controller.

A Rest API request works as such: 
- the get retrieves only the data of a specified resource.
- the post submits an entity, in the application's case, a JSON file, to the database
- the put method updates all the specified representations of a target matching the request content
- and the delete method will delete all the specified resources

if an URI ends with "/:n", that means that a value is passed to te URI, for example, it could be for retreiving a specific item in the database like on
line 25, where the method will fetch a user based on its id.
*/

router.post("/register", register);
router.post("/login", login);
router.get("/", getUsers);
// router.get("/:id", getUser);
router.get('/:id', verify, async function(req,res){
    await getUser(req,res);
});
router.put('/:id', verify, async function(req,res){
    await updateUser(req,res);
});
router.delete('/:id', verify, async function(req,res){
    await deleteUser(req,res);
});

module.exports = router;