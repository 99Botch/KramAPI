// Joi is a library used for object validation
const Joi = require('joi');
// the email regex pattern forces the user to create a password with at leat one letter and number + allow some speial characters
const REG_PATTERN = "^(?=.*[0-9])(?=.*[a-zA-ZÀ-ȕ])([a-zA-ZÀ-ȕ0-9(),-_.,@ ]+)$";

// registerValidation checks the validity of the data passed by /register (e.g, username must be between 6 and 30 characters long and is require for registration)
module.exports.registerValidation = registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string()
            .min(6)
            .max(30)
            .required(),
        // email will accept only three domains -> com, net & org (and can't be under 2 characters)
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } })
            .required(),
        // password has to follow certain regex rule (l.4)
        password: Joi.string()
            .pattern(new RegExp(`${ REG_PATTERN }`))
            .required(),
        // repeat password must match the first one
        repeat_password: Joi.ref('password'),
    });

    return schema.validate(data);
}

// LOGIN VALIDATION
module.exports.loginValidation = loginValidation = (data) => {
    // refer to the above function
    const schema = Joi.object({ 
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required(),
        password: Joi.string()
            .pattern(new RegExp(`${ REG_PATTERN }`))
            .required(),
    });

    return schema.validate(data);
}

// UPDATE PROFILE VALIDATION 
module.exports.updateValidation = updateValidation = (data) => {
    // refer to registerValidation
    const schema = Joi.object({
        username: Joi.string()
            .min(6)
            .max(30)
            .required(),
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required()
    });

    return schema.validate(data);
}

// UPDATE PIC PROFILE 
module.exports.updatePicValidation = updatePicValidation = (data) => {
    // refer to registerValidation
    const schema = Joi.object({
        profile_pic_url: Joi.string()
        .required()
    });

    return schema.validate(data);
}

// UPDATE PASSWORD 
module.exports.updatePasswordValidation = updatePasswordValidation = (data) => {
    // refer to registerValidation
    const schema = Joi.object({
        password: Joi.string()
            .pattern(new RegExp(`${ REG_PATTERN }`))
            .required(),
        // repeat password must match the first one
        repeat_password: Joi.ref('password'),
    });

    return schema.validate(data);   
}

// DECK CREATION
module.exports.deckCreationValidation = deckCreationValidation = (data) => {
    // refer to registerValidation
    const schema = Joi.object({
        name: Joi.string()
            .min(6)
            .max(30)
            .required(),  
        category: Joi.string()
            .required(),
        sub_category: Joi.string()
            .required(),
    });

    return schema.validate(data);
}