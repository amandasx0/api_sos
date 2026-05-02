const pool = require("../config/db");
const formatDate = require("../middlewares/formatDate");

const createOrder = async (
  usuario_id,
  tipo,
  nome,
  descricao,
  urgencia,
  endereco,
  cidade,
  estado,
  latitude,
  longitude,
) => {
  const result = await pool.query(
    `
            INSERT INTO pedidos 
            (usuario_id, tipo, nome, descricao, urgencia, endereco, cidade, estado, latitude, longitude) VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
        `,
    [
      usuario_id,
      tipo,
      nome,
      descricao,
      urgencia,
      endereco,
      cidade,
      estado,
      latitude,
      longitude,
    ],
  );

  const order = result.rows[0];

  return {
    ...order,
    criado_em: formatDate(order.criado_em),
  };
};

const acceptOrder = async (pedido_id, voluntario_id) => {
  const result = await pool.query(
    `
    INSERT INTO atendimentos (pedido_id, voluntario_id)
    VALUES ($1, $2)
    RETURNING *
    `,
    [pedido_id, voluntario_id],
  );

  await pool.query(
    `
    UPDATE pedidos 
    SET status = 'em_andamento'
    WHERE id = $1
    `,
    [pedido_id],
  );

  const atendimento = result.rows[0];

  return {
    ...atendimento,
    iniciado_em: formatDate(atendimento.iniciado_em),
  };
};

const getByOrder = async (pedido_id) => {
  return await pool.query(
    `
    SELECT * FROM atendimentos WHERE pedido_id = $1
    `,
    [pedido_id],
  );
};

const getOrderById = async (pedido_id) => {
  return await pool.query(`SELECT * FROM pedidos WHERE id = $1`, [pedido_id]);
};

const getAllOrder = async () => {
  return await pool.query(`
            SELECT * FROM pedidos
        `);
};

const endOrder = async (pedido_id) => {
  const result = await pool.query(
    `
    UPDATE atendimentos
    SET status = 'resolvido',
        finalizado_em = CURRENT_TIMESTAMP
    WHERE pedido_id = $1
    RETURNING *
    `,
    [pedido_id],
  );

  await pool.query(
    `
    UPDATE pedidos 
    SET status = 'resolvido'
    WHERE id = $1
    `,
    [pedido_id],
  );

  const end = result.rows[0];

  return {
    ...end,
    finalizado_em: formatDate(end.finalizado_em),
  };
};

const updateOrder = async (pedido_id, usuario_id, tipo, mensagem) => {
  const result = await pool.query(
    `
    INSERT INTO atualizacoes_pedidos 
    (pedido_id, usuario_id, tipo, mensagem)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [pedido_id, usuario_id, tipo, mensagem],
  );

  const update = result.rows[0];

  return {
    ...update,
    criado_em: formatDate(update.criado_em),
  };
};

const getUpdateOrder = async (pedido_id) => {
  const result = await pool.query(
    `
    SELECT 
      ap.id,
      ap.mensagem,
      ap.tipo,
      ap.criado_em,
      u.nome AS usuario_nome
    FROM atualizacoes_pedidos ap
    JOIN usuarios u ON ap.usuario_id = u.id
    WHERE ap.pedido_id = $1
    ORDER BY ap.criado_em ASC
    `,
    [pedido_id],
  );

  return result.rows.map((item) => ({
    ...item,
    criado_em: formatDate(item.criado_em),
  }));
};

const getOrders = async (filters) => {
  let query = `SELECT * FROM pedidos WHERE 1=1`;
  const values = [];
  let index = 1;

  if (filters.tipo) {
    query += ` AND tipo = $${index}`;
    values.push(filters.tipo);
    index++;
  }

  if (filters.urgencia) {
    query += ` AND urgencia = $${index}`;
    values.push(filters.urgencia);
    index++;
  }

  if (filters.search) {
    query += ` 
      AND (
        descricao ILIKE $${index}
        OR endereco ILIKE $${index}
        OR cidade ILIKE $${index}
        OR estado ILIKE $${index}
      )
    `;
    values.push(`%${filters.search}%`);
    index++;
  }

  query += ` ORDER BY criado_em DESC`;

  const result = await pool.query(query, values);

  return result.rows.map((order) => ({
    ...order,
    criado_em: formatDate(order.criado_em),
  }));
};

const getOrdersByVoluntary = async (voluntario_id) => {
  return await pool.query(
    `
    SELECT 
      pedidos.id,
      pedidos.nome,
      pedidos.descricao,
      pedidos.urgencia,
      pedidos.status AS pedido_status,
      pedidos.criado_em,
      atendimentos.status AS atendimento_status
    FROM atendimentos
    JOIN pedidos ON atendimentos.pedido_id = pedidos.id
    WHERE atendimentos.voluntario_id = $1
    ORDER BY pedidos.criado_em DESC
    `,
    [voluntario_id]
  );
};

const getOrdersByUser = async (usuario_id) => {
  return await pool.query(
    `
    SELECT 
      id,
      nome,
      descricao,
      urgencia,
      status,
      criado_em
    FROM pedidos
    WHERE usuario_id = $1
    ORDER BY criado_em DESC
    `,
    [usuario_id]
  );
};

module.exports = {
  createOrder,
  acceptOrder,
  getByOrder,
  getAllOrder,
  endOrder,
  updateOrder,
  getUpdateOrder,
  getOrderById,
  getOrders,
  getOrdersByVoluntary,
  getOrdersByUser,
};
