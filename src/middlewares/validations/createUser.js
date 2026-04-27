const Joi = require("joi");

const createUserSchema  = Joi.object({
  nome: Joi.string().min(3).required().messages({
    "string.empty": "Nome é obrigatório",
    "string.min": "Nome deve ter pelo menos 3 caracteres",
    "any.required": "Nome é obrigatório",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email é obrigatório",
    "string.email": "Email inválido",
    "any.required": "Email é obrigatório",
  }),
  senha: Joi.string()
    .min(5)
    .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&]).+$"))
    .required()
    .messages({
      "string.empty": "Senha é obrigatória",
      "string.min": "Senha deve ter no mínimo 5 caracteres",
      "string.pattern.base":
        "Senha deve conter pelo menos uma letra, um número e um caractere especial",
      "any.required": "Senha é obrigatória",
    }),
    tipo: Joi.string().valid("afetado", "voluntario", "admin").optional(),
});

function verifyCreateUser(req, res, next) {
    const { error } = createUserSchema.validate(req.body, {abortEarly: false})

    if (error) {
        return res.status(400).json ({
            error: error.details.map(e => e.message)
        })
    } 

    next()
}

module.exports = verifyCreateUser;