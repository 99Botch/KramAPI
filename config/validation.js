// VALIDATION
const Joi = require('joi');
// EMAIL REGEX PATTERN
const REG_PATTERN = "^(?=.*[0-9])(?=.*[a-zA-ZÀ-ȕ])([a-zA-ZÀ-ȕ0-9(),-_.,@ ]+)$";

// REGISTER VALIDATION
const registerValidation = (data) => {

    const schema = Joi.object({
        username: Joi.string()
            .min(6)
            .max(30)
            .required(),
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required(),
        password: Joi.string()
            .pattern(new RegExp(`${ REG_PATTERN }`))
            .required(),
        repeat_password: Joi.ref('password'),
    });

    return schema.validate(data);
}

// LOGIN VALIDATION
const loginValidation = (data) => {

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

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
