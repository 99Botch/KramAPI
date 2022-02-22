// tokenValidation is there to check the identity of the user after successful log in
// jwt insure secure information transmission through a compact and self detained string holding information
// such as the user's mail address.
const jwt = require('jsonwebtoken');
const Sessions  = require('../models/sessions.model');


module.exports = function(req, res, next){
    // Authorization request header can be used to provide credentials that authenticate a user agent with a server, allowing access to a protected resource (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
    // if the token doesn't exist, access to the protected toutes is forbidden
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.status(401).json('Access Denied');

    // user is not recognized or expired, ths access is not granted. SECRET_KEY dechiphers the token
    jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
        
        if (err){
            const deleteExpiredToken = await Sessions.deleteOne({ user_id: req.params.id }); 
            return res.status(401).json({err: err, message: "login to your account", deletion: deleteExpiredToken });
        } 
        req.user = user;
        next();
    });
}