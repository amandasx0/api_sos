const Joi = require("joi");

const createShelterSchema = Joi.object({
  nome: Joi.string().required(),
  endereco: Joi.string().required(),
  cidade: Joi.string().required(),
  estado: Joi.string().required(),
  capacidade_total: Joi.number().required(),
  capacidade_ocupada: Joi.number().required(),

  telefone: Joi.string()
    .pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "Telefone inválido (use formato brasileiro com DDD)",
      "string.empty": "Telefone é obrigatório",
    }),

  aceita_animais: Joi.boolean(),
  aceita_pcd: Joi.boolean(),
  aceita_idoso: Joi.boolean(),
  aceita_crianca: Joi.boolean(),
});

function verifyCreateShelter(req, res, next) {
    const { error } = createShelterSchema.validate(req.body, {abortEarly: false})

    if (error) {
        return res.status(400).json ({
            error: error.details.map(e => e.message)
        })
    } 

    next()
}

module.exports = verifyCreateShelter;