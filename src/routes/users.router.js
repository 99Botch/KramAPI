// Import the dependecies & functions necessary to run the API - routers allows us to create routes to a specific file
const router = require('express').Router();


// imports the function from tokenValidation. The function gets the user tokens as parameters
// and checks the validity of the the user credentials before allowing access to the protected routes.
const verify  = require('../config/tokenValidation'); 


/* 
    Each URI is unique and refers to a function in the user controller:
    i.e., if the URI /users/register is called, the application knows what function the POST request refers to,
    the crontroller sends the request and waits a response, expecting either a fail or success response 

    Request work as such: 
    - GET only retrieves data of a specified resource
    - POST submits an entity, for Kram, a JSON file, to the database
    - PUT method updates all the specified representations of a target matching the request content
    - DELETE removes all the specified resources

    if an URI ends with "/:n", a value is passed to te URI, i.e.: 
    the function getUser expect an id in the URI to retrieve the user
*/
const { 
    register, login, getUsers, getUser, updateUser, deleteUser, getUserPic, logout, getSession, updateUserPic, updateUserPassword 
} = require('../controllers/users.controller');


// USER URIs --------------------------------------------------------------------------------------------------------------------
router.post("/register", register);

router.get("/", getUsers);

// if 'verify' is passed in the parameters, the user token is passed for verification
router.get('/:id', verify, async function(req,res){
    await getUser(req,res);
});

router.get('/pic/:id', verify, async function(req,res){
    await getUserPic(req,res);
});

router.put('/:id', verify, async function(req,res){
    await updateUser(req,res);
});

router.put('/pic/:id', verify, async function(req,res){
    await updateUserPic(req,res);
});

router.put('/password/:id', verify, async function(req,res){
    await updateUserPassword(req,res);
});

router.delete('/:id', verify, async function(req,res){
    await deleteUser(req,res);
});

// SESSION URIS --------------------------------------------------------------------------------------------------------------------
router.post("/login", login);

router.get("/session/:id", getSession);

router.delete('/logout/:id', verify, async function(req,res){
    await logout(req,res);
});

module.exports = router;