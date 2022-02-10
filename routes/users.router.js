// Import the dependecies necessary to run the API
// routers allows us to create routes in a specific file
const router = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt  = require('jsonwebtoken');
// import the schema UserSchema as 'User'
const User  = require('../models/users.model');
const { registerValidation, loginValidation, updateValidation }= require('../config/validation')
const verify  = require('../config/tokenValidation'); 
const { prependOnceListener } = require('../models/users.model');


// REGISTER NEW USER
router.post('/register', async (req, res) => {
    // Every user route will be accessible via /users/request_name (+ /:id to access a specific item)
    // here the request is a 'post' one since the user details are sent to the db to be saved

    // for registerValidation refer to ../config/validation -> if true, the API renders  the error
    const { error } = await registerValidation(req.body);
    if(error) return res.status(400).json(error.details[0]);

    // isCreditsTaken checks the uniqueness of the username & mail address via findOne which sends a query to the db -> if true, the API renders  the error
    const isCreditsTaken = await User.findOne({ 
        $or: [ {username: req.body.username}, { email: req.body.email} ]
    });
    if(isCreditsTaken) return res.status(400).json('Username or Email is already taken');

    // .hash takes two parameters to cypher a password:  the password in plain text & salt (a random string) 
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    /* at this point, all that is left is to create a new user based on the schema of the user model By hashing a plain text password plus a salt, the hash algorithm’s output is no longer predictable. 
    // The same password will no longer yield the same hash. The salt gets automatically included with the hash, so you do not need to store it in a database. (https://heynode.com/blog/2020-04/salt-and-hash-passwords-bcrypt/) */
    const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    });

    // and send the user to the db
    try{
        const registeredUser = await newUser.save();
        res.status(200).json(registeredUser);
    } catch (err) { res.status(400).send(err) }
});


// LOGIN TO PROFILE
router.post('/login', async (req, res) => {

    // for loginValidation refer to ../config/validation -> if true, the API renders  the error
    const { error } = await loginValidation(req.body);
    if(error) return res.status(400).json(error.details[0]);

    // checking if the usermail is valid -> if true, the API renders  the error
    const user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).json({ message: "Email not found or invalid" });

    // .compare checks the validity of the req.body.password (from the form) against user.password (hashed) -> if true, the API renders  the error
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).json({ message: 'Invalid password' });   

    // tokens are made of: 1. User _id 2. user mail 3. Secret key (.env) and will expire after 3 hours
    const token = jwt.sign( { _id: user.id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '3h' });
    res.json(token);
});


// FIND ALL USERS
router.get('/', async (req, res) => {
    // .find() retrieves all the users in the database regardless of their information
    try{
        const users = await User.find();
        if(!users) return res.status(404).json("no users in the db");
        res.json(users);

    } catch(err) { res.status(500).json({message: err}) }
});


// FIND USER BY /:ID
router.get('/:id', async (req, res) => {
    // refer to the above function for further explanation
    try{
        const user =  await User.findById(req.params.id);
        if(!user) return res.status(404).json("user not found");
        res.json(user);  

    } catch(err) { res.status(500).json({message: err}) }
});  


// UPDATE USER PROFILE
router.put('/:id', verify, async (req, res) => {
    // refer to 'verify' in ../config/tokenValidation
    try{
        // first step consists to check the validity of the token by comparing the _id from the token against the id of the session
        // req.params property is an object containing properties mapped to the named route “parameters” (e.g., the id passed in the URI)
        let id = req.params.id || {};
        if (id != req.user._id) return res.status(401).json("Ids aren't matching");

        // for updateValidation refer to ../config/validation -> if true, the API renders the error
        const { error } = await updateValidation(req.body);
        if(error) return res.status(400).json(error.details[0]);

        // isCreditsTaken checks the uniqueness of the username & mail address via findOne which sends a query to the db -> if true, the API renders  the error
        const user =  await User.findById(id);
        let username =  user.username;
        let email =  user.email;

        if(!user) return res.status(404).json("user not found");

        const isCreditsTaken = await User.findOne({ 
            $or: [{ username: req.body.username }, { email: req.body.email }]
        });

        if (!isCreditsTaken) return res.status(200).json('success')


        if (id !== isCreditsTaken._id && (username != req.body.username && email !=  req.body.email)) return res.status(400).json('MEEEEEEEERDE');
        return res.status(200).json('Username or Email is already taken ');

        /*if (isCreditsTaken){
            console.log(username)
            console.log(req.body.username)
            // if botch old mail & old username
            if (username == req.body.username && email == req.body.email){
                return res.status(200).json('success 1');
            }

            if ((email != req.body.email && username == req.body.username) && req.body.email !== email ){
                return res.status(400).json('Username or Email is already taken 2');
            }

            if ((username != req.body.username && username == req.body.email) && req.body.username !== username ){
                return res.status(400).json('Username or Email is already taken 3');
            }

            // if old username and new mail
            if (username == req.body.username && email != req.body.email){
                return res.status(200).json('success 2');
            }

            // if old mail nd anew username
            if (email == req.body.email && username != req.body.username){
                return res.status(200).json('success 3');
            }


            else{
                return res.status(400).json('Username or Email is already taken 1');
            }

        }*/

    

        
        
        return res.status(400).json('Username or Email is already taken ');
        // _katyusha
        // _alpha

        // user.username 
        // user.email

        // updateUser is a new object of the user schema which may take the profile_pic_url attribute. _id act as the identifier for the db
        // const updateUser = await User.updateOne(
        //     {_id: req.params.id}, 
        //     { $set: { 
        //         username: req.body.username, 
        //         email: req.body.email,
        //         profile_pic_url: req.body.profile_pic_url 
        //     }}
        // );
        // res.json(updateUser);

    } catch(err) { res.json({message: err}) }
});  


// DELETE USER PROFILE
router.delete('/:id', verify, async (req, res) => {
    // refer to the above function for further explanation
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    // _id act as the identifier for the db for deletion
    try{
        const removeUser = await User.deleteOne({_id: req.params.id}); 
        res.json(removeUser); 
    } catch(err) { res.json({message: err}) }
});    

module.exports = router;