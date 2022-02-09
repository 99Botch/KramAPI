const router = require('express').Router();
const User  = require('../models/users.model');
const bcrypt  = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const { registerValidation, loginValidation }= require('../config/validation')
const verify  = require('../config/tokenValidation'); 

// REGISTER NEW USER
router.post('/register', async (req, res) => {

    // joi validation
    const { error } = await registerValidation(req.body);

    // validation error
    if(error) return res.status(400).json({
        validation: false,
        message: error.details[0]
    });

    // checking if the user mail is already in the database by sending a request
    const isCreditsTaken = await User.findOne({ 
        $or: [
            {username: req.body.username}, 
            { email: req.body.email}
        ]
    });

    // uniqueness compromise
    if(isCreditsTaken) return res.status(400).json({
        success: false,
        message: 'Username or Email is already taken'
    });

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

// LOGIN
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

// FIND ALL
router.get('/', async (req, res) => {
    try{
        const users = await User.find();
        res.json(users);
    } catch(err) { res.status(500).json({message: err}) }
});

// FIND BY ID
router.get('/:id', verify, async (req, res) => {
    try{
        const user =  await User.findById(req.params.id);
        res.json(user);    
    } catch(err) { res.status(500).json({message: err}) }
});  

// update
router.put('/:id', verify, async (req, res) => {
    try{
        const updateUser = await User.updateOne(
            {_id: req.params.id}, 
            { $set: { 
                username: req.body.username, 
                email: req.body.email 
            } }
        );
        res.json(updateUser);
    } catch(err) {
        res.json({message: err})
    }
});  

module.exports = router;