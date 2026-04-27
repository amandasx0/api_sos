const Joi = require("joi");

const createOrderSchema = Joi.object({
  nome: Joi.string().min(3).required().messages({
    "string.empty": "Nome é obrigatório",
    "string.min": "Nome deve ter pelo menos 3 caracteres",
    "any.required": "Nome é obrigatório",
  }),
  tipo: Joi.string()
    .valid("resgate", "comida_e_agua", "medico")
    .required(),

  descricao: Joi.string().allow(""),

  urgencia: Joi.string().valid("urgente", "medio", "sem_urgencia").required(),

  endereco: Joi.string().optional(),
  cidade: Joi.string().optional(),
  estado: Joi.string().optional(),

  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

function verifyCreateOrder(req, res, next) {
  const { error } = createOrderSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: error.details.map((e) => e.message),
    });
  }

  next();
}

module.exports = verifyCreateOrder;
