function onlyVoluntario(req, res, next) {
  if (req.user.tipo === "afetado") {
    return res.status(403).json({ message: "Apenas voluntários ou admin podem acessar" });
  }

  next();
}

module.exports = onlyVoluntario;