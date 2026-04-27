const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().required(),
});

function verifyLogin(req, res, next) {
    const { error } = loginSchema .validate(req.body, {abortEarly: false})

    if (error) {
        return res.status(400).json ({
            error: error.details.map(e => e.message)
        })
    } 

    next()
}

module.exports = verifyLogin;