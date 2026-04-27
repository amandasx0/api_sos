const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Token não encontrado" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    req.user = decoded;
    const voluntario_id = req.user.id;

    next();
  } catch (error) {
    console.log(error); 
    return res.status(400).json({ message: "Erro ao validar o token" });
  }
};

module.exports = auth;
