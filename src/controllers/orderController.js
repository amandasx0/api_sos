const orderModels = require("../models/orderModels");
const shelterModels = require("../models/shelterModels")
const getLocation = require("../middlewares/geolocation");
const formatDate = require("../middlewares/formatDate");
const geocode = require("../middlewares/geocode");

const createOrder = async (req, res) => {
  try {
    const {
      tipo,
      nome,
      descricao,
      urgencia,
      endereco,
      cidade,
      estado,
      latitude,
      longitude,
    } = req.body;

    let finalEndereco = endereco;
    let finalCidade = cidade;
    let finalEstado = estado;
    let finalLat = latitude;
    let finalLng = longitude;

    if (latitude && longitude) {
      const location = await getLocation(latitude, longitude);

      finalEndereco = location.endereco;
      finalCidade = location.cidade;
      finalEstado = location.estado;
    } else if (endereco && cidade && estado) {
      try {
        const coords = await geocode(endereco, cidade, estado);

        finalLat = coords.lat;
        finalLng = coords.lng;
      } catch (err) {
        console.log("Geocode falhou, salvando sem coordenadas");
      }
    } else {
      return res.status(400).json({
        message: "Informe localização ou endereço completo",
      });
    }

    const result = await orderModels.createOrder(
      req.user.id,
      tipo,
      nome,
      descricao,
      urgencia,
      finalEndereco,
      finalCidade,
      finalEstado,
      finalLat,
      finalLng,
    );

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao criar pedido" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const pedido_id = req.params.id;
    const { mensagem } = req.body;
    const usuario_id = req.user.id;

    const order = await orderModels.getOrderById(pedido_id);

    if (order.rows.length === 0) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    const orderData = order.rows[0];

    const costumer = await orderModels.getByOrder(pedido_id);

    const isAffect = orderData.usuario_id === usuario_id;
    const isVoluntary =
      costumer.rows.length > 0 && costumer.rows[0].voluntario_id === usuario_id;

    if (!isAffect && !isVoluntary) {
      return res.status(403).json({
        message: "Você não tem permissão para enviar mensagens neste pedido",
      });
    }

    const tipo = isVoluntary ? "voluntario" : "afetado";

    const result = await orderModels.updateOrder(
      pedido_id,
      usuario_id,
      tipo,
      mensagem,
    );

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao enviar mensagem" });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const result = await orderModels.getAllOrder();
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error ao buscar todos os pedidos." });
  }
};

const endOrder = async (req, res) => {
  try {
    const pedido_id = req.params.id;

    const order = await orderModels.getOrderById(pedido_id);

    if (order.rows.length === 0) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    const result = await orderModels.endOrder(pedido_id);
    res.status(200).json({ message: "Atendimento finalizado com sucesso." });
  } catch (error) {
    res.status(500).json({ message: "Erro ao finalizar o atendimento" });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const pedido_id = req.params.id;
    const usuario_id = req.user.id;

    const order = await orderModels.getOrderById(pedido_id);

    if (order.rows.length === 0) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    const exists = await orderModels.getByOrder(pedido_id);

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "Pedido já está em atendimento",
      });
    }

    if (req.user.tipo !== "voluntario") {
      return res.status(403).json({
        message: "Apenas voluntários podem assumir pedidos",
      });
    }

    const result = await orderModels.acceptOrder(pedido_id, usuario_id);

    res.status(200).json({ message: "Atendimento aceito com sucesso" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao aceitar o atendimento." });
  }
};

const getUpdateOrder = async (req, res) => {
  try {
    const pedido_id = req.params.id;

    const order = await orderModels.getOrderById(pedido_id);

    if (order.rows.length === 0) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    const result = await orderModels.getUpdateOrder(pedido_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Erro ao pegar as mensagens." });
  }
};

const getOrders = async (req, res) => {
  try {
    const { tipo, urgencia, search } = req.query;

    const validType = ["resgate", "comida_e_agua", "medico"];
    const validUrgencia = ["urgente", "medio", "sem_urgencia"];

    if (tipo && !validType.includes(tipo)) {
      return res.status(400).json({ message: "Tipo inválido" });
    }

    if (urgencia && !validUrgencia.includes(urgencia)) {
      return res.status(400).json({ message: "Urgência inválida" });
    }

    const result = await orderModels.getOrders({
      tipo,
      urgencia,
      search,
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao buscar atendimentos",
    });
  }
};

const getVolunteerActivity = async (req, res) => {
  try {
    const voluntario_id = req.user.id;

    const [reservas, pedidos] = await Promise.all([
      shelterModels.getReservationsByVoluntario(voluntario_id),
      orderModels.getOrdersByVoluntary(voluntario_id),
    ]);

    const reservasFormatadas = reservas.rows.map((item) => ({
      tipo: "reserva",
      id: item.id,
      status: item.status,
      titulo: item.abrigo_nome,
      descricao: `Solicitação de ${item.usuario_nome}`,
      quantidade: item.quantidade,
      criado_em: formatDate(item.criado_em),
    }));

    const pedidosFormatados = pedidos.rows.map((item) => ({
      tipo: "pedido",
      id: item.id,
      status: item.status,
      titulo: item.nome,
      descricao: item.descricao,
      criado_em: formatDate(item.criado_em),
    }));

    const result = [...reservasFormatadas, ...pedidosFormatados].sort(
      (a, b) => new Date(b.criado_em) - new Date(a.criado_em)
    );

    return res.status(200).json(result);

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Erro ao buscar atividades",
    });
  }
};

module.exports = {
  createOrder,
  updateOrder,
  getAllOrder,
  endOrder,
  acceptOrder,
  getUpdateOrder,
  getOrders,
  getVolunteerActivity
};
