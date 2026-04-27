const shelterModels = require("../models/shelterModels");
const formatDate = require("../middlewares/formatDate");

const createShelter = async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (capacidade_ocupada > capacidade_total) {
      return res
        .status(404)
        .json({ message: "Capacidade ocupada não pode ser maior que a total" });
    }

    const result = await shelterModels.createShelter(
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
      req.user.id
    )

     res.status(201).json({ message: "Abrigo cadastrado com sucesso", abrigo: result })
  } catch (error) {
    res.status(500).json({ message: "Error ao cadastrar abrigo", error });
  }
};

const allShelters = async (req, res) => {
    try {
        const result = await shelterModels.allShelters();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Nenhum abrigo encontrado"})
        }

        res.status(200).json(result.rows)
    } catch (error) {
        res.status(500).json({message: "Error ao buscar abrigos"})
    }
}

const requestReservation = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const abrigo_id = req.params.id;
        const { quantidade } = req.body;

        const result = await shelterModels.requestReservation(abrigo_id, usuario_id, quantidade);

        const shelters = await shelterModels.getShelter(abrigo_id)

        if (shelters.rows.length === 0) {
            return res.status(404).json({
                message: "Abrigo não encontrado"
            })
        }

        res.status(201).json({
            message: "Solicitação feita com sucesso",
            reserva: result.rows[0],
        })
    } catch (error) {
        res.status(500).json({ message: "Error ao solicitar a vaga" })
    }
}

const replyReservation = async (req, res) => {
  try {
    const reserva_id = req.params.id;
    const { status } = req.body;

    const reservation = await shelterModels.getRequest(reserva_id);

    if (reservation.rows.length === 0) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }

    const { abrigo_id, quantidade } = reservation.rows[0];

    const shelter = await shelterModels.getShelter(abrigo_id); 
    const dataShelter = shelter.rows[0];

    if (dataShelter.voluntario_id_abrigo !== req.user.id) { 
      return res.status(403).json({ message: "Não autorizado" });
    }

    if (status === "aprovado") {
      const { capacidade_total, capacidade_ocupada } = dataShelter;

      if (capacidade_ocupada + quantidade > capacidade_total) {
        return res.status(400).json({
          message: "Capacidade insuficiente",
        });
      }

      await shelterModels.updateShelter(quantidade, abrigo_id);
    }

    await shelterModels.updateRequestReservation(status, reserva_id);

    return res.status(200).json({
      message: "Reserva atualizada com sucesso",
    });

  } catch (error) {
    console.log(error); 
    return res.status(500).json({
      message: "Error ao atualizar reserva.",
    });
  }
};

const getReservationsByVoluntario = async (req, res) => {
  try {
    const voluntario_id = req.user.id;

    const result = await shelterModels.getReservationsByVoluntario(voluntario_id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Nenhuma solicitação encontrada",
      });
    }

     const formatted = result.rows.map((item) => ({
        ...item,
        criado_em: formatDate(item.criado_em),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar solicitações",
    });
  }
};

module.exports = { createShelter, allShelters, requestReservation, replyReservation, getReservationsByVoluntario }
