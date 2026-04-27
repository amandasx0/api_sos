const pool = require("../config/db");

const createUser = async (nome, email, senhaHash, tipo) => {
  return await pool.query(
    `
            INSERT INTO usuarios (nome, email, senha, tipo)
            VALUES ($1, $2, $3, $4) RETURNING *
        `,
    [nome, email, senhaHash, tipo],
  );
};

const loginModel = async (email) => {
  return await pool.query(
    `
          SELECT * FROM usuarios WHERE email=$1
        `,
    [email],
  );
};

const allUsers = async () => {
  return await pool.query(`
      SELECT nome, email, id, tipo FROM usuarios;
    `);
};

module.exports = { createUser, loginModel, allUsers };
