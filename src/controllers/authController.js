const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModels = require("../models/userModels");

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await userModels.loginModel(email);

    if (usuario.rows.length === 0) {
      return res.status(400).json({
        message: "Usuário não existe",
      });
    }

    const senhaValid = await bcrypt.compare(senha, usuario.rows[0].senha);

    if (!senhaValid) {
      return res.status(400).json({ message: "Senha inválida" });
    }

    const token = jwt.sign({ id: usuario.rows[0].id, tipo: usuario.rows[0].tipo }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        id: usuario.rows[0].id,
        nome: usuario.rows[0].nome,
        email: usuario.rows[0].email,
        tipo: usuario.rows[0].tipo,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erro interno no servidor", error });
  }
};

module.exports = { login };
