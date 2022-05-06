// JOI is a library that utilizes schema for object validation
const Joi = require('joi');

// REG_PATTERN specifies password format rules: a password must contain at least one uppercase and lowercase letter, 
// a number and a special character: -_.,@ ]+
const REG_PATTERN = "^(?=.*[0-9])(?=.*[a-zA-ZÀ-ȕ])([a-zA-ZÀ-ȕ0-9(),-_.,@ ]+)$";

/**
    registerValidation checks the client's request to registe a new profile
    e.g. 'username' must be between 6 and 30 characters long  and is required for registration
    emails only accepts domain names finishing by .com, .net & .org
    'email' must follow REG_PATTERN rules & 'repeat_password' must match 'password'
*/
module.exports.registerValidation = registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string()
            .min(6)
            .max(30)
            .required(),
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } })
            .required(),
        password: Joi.string()
            .pattern(new RegExp(`${ REG_PATTERN }`))
            .required(),
        repeat_password: Joi.ref('password'),
    });

    return schema.validate(data);
}

// REFER TO THE ABOVE FUNCTION FOR EXPLANATION
// LOGIN VALIDATION --------------------------------------------------------------------------------------------------------------------
module.exports.loginValidation = loginValidation = (data) => {
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

// UPDATE VALIDATION --------------------------------------------------------------------------------------------------------------------
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

// UPDATE PIC VALIDATION --------------------------------------------------------------------------------------------------------------------
module.exports.updatePicValidation = updatePicValidation = (data) => {
    const schema = Joi.object({
        profile_pic_url: Joi.string()
        .required()
    });

    return schema.validate(data);
}

// UPDATE PASSWORD VALIDATION --------------------------------------------------------------------------------------------------------------------
module.exports.updatePasswordValidation = updatePasswordValidation = (data) => {
    const schema = Joi.object({
        new_password: Joi.string()
            .pattern(new RegExp(`${ REG_PATTERN }`))
            .required(),
        repeat_password: Joi.ref('new_password'),
        old_password: Joi.string()
            .required(),
        current_password: Joi.string()
            .required(),
    });

    return schema.validate(data);   
}

// DECK CREATION VALIDATION --------------------------------------------------------------------------------------------------------------------
module.exports.deckCreationValidation = deckCreationValidation = (data) => {
    // refer to registerValidation
    const schema = Joi.object({
        name: Joi.string()
            .min(6)
            .max(30)
            .required(),  
        category: Joi.string()
            .required()
    });

    return schema.validate(data);
}