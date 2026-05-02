const pool = require("../config/db");
const formatDate = require("../middlewares/formatDate");

const createShelter = async (
  nome,
  endereco,
  cidade,
  estado,
  capacidade_total,
  capacidade_ocupada,
  telefone,
  aceita_animais,
  aceita_pcd,
  aceita_idoso,
  aceita_crianca,
  voluntario_id,
) => {
  const result = await pool.query(
    `
            INSERT INTO abrigos 
            (nome, endereco, cidade, estado, capacidade_total, capacidade_ocupada, telefone, aceita_animais, aceita_pcd, aceita_idoso, aceita_crianca, voluntario_id_abrigo)
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `,
    [
      nome,
      endereco,
      cidade,
      estado,
      capacidade_total,
      capacidade_ocupada,
      telefone,
      aceita_animais,
      aceita_pcd,
      aceita_idoso,
      aceita_crianca,
      voluntario_id,
    ],
  );

  const abrigo = result.rows[0];

  return {
    ...abrigo,
    criado_em: formatDate(abrigo.criado_em),
  };
};

const allShelters = async () => {
  return await pool.query(`
        SELECT * FROM abrigos;
    `);
};

const requestReservation = async (abrigo_id, usuario_id, quantidade) => {
  return await pool.query(
    `
            INSERT INTO reservas_abrigo (abrigo_id, usuario_id, quantidade)
            VALUES ($1, $2, $3) RETURNING *
        `,
    [abrigo_id, usuario_id, quantidade],
  );
};

const getRequest = async (reserva_id) => {
  return await pool.query(
    `
            SELECT * FROM reservas_abrigo WHERE id = $1    
        `,
    [reserva_id],
  );
};

const getShelter = async (abrigo_id) => {
  return await pool.query(
    `SELECT * FROM abrigos WHERE id = $1`,
    [abrigo_id],
  );
};

const updateShelter = async (quantidade, abrigo_id) => {
  return await pool.query(
    `
            UPDATE abrigos
            SET capacidade_ocupada = capacidade_ocupada + $1
            WHERE id = $2
        `,
    [quantidade, abrigo_id],
  );
};

const updateRequestReservation = async (status, reserva_id) => {
  return await pool.query(
    `
            UPDATE reservas_abrigo SET status = $1 WHERE id = $2
        `,
    [status, reserva_id],
  );
};

const getReservationsByVoluntario = async (voluntario_id) => {
  return await pool.query(
    `
    SELECT 
      reservas_abrigo.id,
      reservas_abrigo.quantidade,
      reservas_abrigo.status,
      reservas_abrigo.criado_em,
      abrigos.id AS abrigo_id,
      abrigos.nome AS abrigo_nome,
      usuarios.id AS usuario_id,
      usuarios.nome AS usuario_nome
    FROM reservas_abrigo
    JOIN abrigos ON reservas_abrigo.abrigo_id = abrigos.id
    JOIN usuarios ON reservas_abrigo.usuario_id = usuarios.id
    WHERE abrigos.voluntario_id_abrigo = $1
    ORDER BY reservas_abrigo.criado_em DESC
    `,
    [voluntario_id],
  );
};

const getReservationsByUser = async (usuario_id) => {
  return await pool.query(
    `
    SELECT 
      reservas_abrigo.id,
      reservas_abrigo.quantidade,
      reservas_abrigo.status,
      reservas_abrigo.criado_em,
      abrigos.nome AS abrigo_nome
    FROM reservas_abrigo
    JOIN abrigos ON reservas_abrigo.abrigo_id = abrigos.id
    WHERE reservas_abrigo.usuario_id = $1
    ORDER BY reservas_abrigo.criado_em DESC
    `,
    [usuario_id]
  );
};

module.exports = {
  createShelter,
  allShelters,
  requestReservation,
  getRequest,
  getShelter,
  updateShelter,
  updateRequestReservation,
  getReservationsByVoluntario,
  getReservationsByUser,
};
