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
    const token = jwt.sign( { _id: user.id }, process.env.SECRET_KEY, { expiresIn: '3h' });
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
        // first step consists to ccheck whether the user tries to update his profile or not
        let id = req.params.id || {};
        if (id != req.user._id) return res.status(401).json("Ids aren't matching");

        // for updateValidation refer to ../config/validation -> if the format attributes format aren't respected, API throws an error
        const { error } = await updateValidation(req.body);
        if(error) return res.status(400).json(error.details[0]);

        // Promise.all sends to request with the promise to return both queries or none
        // the first query gets the user details while the second checks whether the update details already exists
        Promise.all([
            User.findOne({ _id: id }),
            User.findOne({ 
                $or: [{ username: req.body.username }, { email: req.body.email }] 
            })
        ])
        .then( async ([ user, isCreditsTaken ]) => {
            // user details
            let old_username = user.username, old_email = user.email
    
            // create new object to push to the query
            const updUser = await new User({
                _id: id,
                username: req.body.username,
                email: req.body.email,
                profile_pic_url: req.body.profile_pic_url
            });
            
            // User is pushed to the database if the details don't exists or if the user is not updating is mail/username
            if (!isCreditsTaken || isCreditsTaken && old_username == req.body.username && old_email == req.body.email){
                let updateValidation = await updateQuery(updUser);
                return res.status(200).json(updateValidation);
            }

            // if either req has old mail and anew username or if req has old username and new mail
            if (isCreditsTaken && (old_username == req.body.username && old_email != req.body.email) || (old_email == req.body.email && old_username != req.body.username)){
                let updateValidation = await updateQuery(updUser);
                return res.status(200).json(updateValidation);
            }

            return res.status(400).json('Username or Email is already taken');
        });

    } catch(err) { res.json({message: err}) }
});  

async function updateQuery (_updUser) {
    // updateUser is a new object of the user schema which may take the profile_pic_url attribute. _id act as the identifier for the db
    const updateUser = await User.updateOne(
        {_id: _updUser._id}, 
        { $set: { 
            username: _updUser.username, 
            email: _updUser.email,
            profile_pic_url: _updUser.profile_pic_url 
        }}
    );
    return updateUser;
}


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