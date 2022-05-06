/*
    tokenValidation checks users' credentials to grant them access to protected routes
    jwt insure secure information transmission through a compact and self detained string holding information such as the user's mail address:
    https://jwt.io/introduction 

    Sessions schema is imported to check the tokens strucutre according to the blueprint
*/
const jwt = require('jsonwebtoken');
const Sessions  = require('../models/sessions.model');

/** 
    Authorization request header can be used to provide credentials that authenticate a user agent with a server (l.17 & 18), 
    allowing access to a protected resource: (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
    if the token doesn't exist, access to the protected routes are forbidden
*/
module.exports = function(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({message: 'Error | Access Denied'});

    // user is not recognized or expired, ths access is not granted, SECRET_KEY act as an id when token gets deciphered to check it authenticity
    jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
        
        if (err){
            const expiredSession =  await Sessions.findOne({ user_id: req.params.id }); 
            
            // if a token stored in the database & whose user id matches the user credentials, that token is deleted from the 
            // database and a new one is created
            if(expiredSession){
                let sessionId = expiredSession._id.toString()
                const deleteExpiredToken = await Sessions.findByIdAndRemove({ _id: sessionId }); 
                return res.status(401).json({err: err, message: "login to your account", deletion: deleteExpiredToken });
            }
        } 
        req.user = user;
        next();
    });
}