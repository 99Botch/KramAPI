// Import the dependecies necessary to run the API
// routers allows us to create routes in a specific file
const router = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt  = require('jsonwebtoken');
// import the schema UserSchema as 'User'
const User  = require('../models/users.model');
const { registerValidation, loginValidation }= require('../config/validation')
const verify  = require('../config/tokenValidation'); 

// REGISTER NEW USER
router.post('/register', async (req, res) => {
    // Every user route will be accessible via /users/request_name (+ /:id to access a specific item)
    // here the request is a 'post' one since the user details are sent to the db to be saved

    // refer to ../config/validation -> registerValidation for further explanation
    const { error } = await registerValidation(req.body);

    // validation error
    if(error) return res.status(400).json(error.details[0]);

    // checking if the user mail is already in the database by sending a request
    const isCreditsTaken = await User.findOne({ 
        $or: [ {username: req.body.username}, { email: req.body.email} ]
    });

    // uniqueness compromise
    if(isCreditsTaken) return res.status(400).json('Username or Email is already taken');

    // hash passwords
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    // newUser object
    const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    });

    // send object to db
    try{
        // res.status(200).json(newUser);
        const registeredUser = await newUser.save();
        res.status(200).json(registeredUser);
    } catch (err) { res.status(400).send(err) }

});

// LOGIN TO PROFILE
router.post('/login', async (req, res) => {

    // joi validation
    const { error } = await loginValidation(req.body);

    // validation error
    if(error) return res.status(400).json( error.details[0]);

    // checking if the user mail or username exist
    const user = await User.findOne({ email: req.body.email });

    // either the mail or username don't exist
    if(!user) return res.status(400).json({ message: "Email not found or invalid" });

    // check password validity
    const validPassword = await bcrypt.compare(req.body.password, user.password);

    // feedback
    if(!validPassword) return res.status(400).json({ message: 'Invalid password' });

    // create and assign a token
    const token = jwt.sign( { _id: user.id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '3h' });
    res.json(token);

});

// FIND ALL USERS
router.get('/', async (req, res) => {
    try{
        const users = await User.find();
        res.json(users);
    } catch(err) { res.status(500).json({message: err}) }
});

// FIND USER BY ID
router.get('/:id', async (req, res) => {
    try{
        const user =  await User.findById(req.params.id);
        if(!user) return res.status(404).json("user not found");
        res.json(user);    
    } catch(err) { res.status(500).json({message: err}) }
});  

// UPDATE USER
router.put('/:id', verify, async (req, res) => {
    try{

        let id = req.params.id || {};
        if (id != req.user._id) return res.status(401).json("Ids aren't matching");

        const updateUser = await User.updateOne(
            {_id: req.params.id}, 
            { $set: { 
                username: req.body.username, 
                email: req.body.email,
                profile_pic_url: req.body.profile_pic_url 
            } }
        );
        res.json(updateUser);
    } catch(err) {
        res.json({message: err})
    }
});  

// DELETE USER
router.delete('/:id', verify, async (req, res) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        const removeUser = await User.deleteOne({_id: req.params.id}); 
        res.json(removeUser); 

    } catch(err) {
        res.json({message: err})
    }
});    

module.exports = router;