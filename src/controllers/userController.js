const bcrypt = require("bcrypt")
const userModels = require("../models/userModels")

const createUser = async (req, res) => {
    try {
        const {nome, email, senha, tipo} = req.body;

        const senhaHash = await bcrypt.hash(senha, 10);
        const tipoFinal = tipo || "afetado";

        const result = await userModels.createUser(
            nome,
            email,
            senhaHash,
            tipoFinal
        );

        res.status(201).json({message: "Usuário criado com sucesso", usuario: result.rows[0]})

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error ao criar usuário"})
    }
}

const allUsers = async (req, res) => {
    try {
        const result = await userModels.allUsers();
        res.status(200).json(result.rows)
    } catch (error) {
        res.status(500).json({message: "Error ao buscar todos os usuários"})
    }
}

module.exports = {
    createUser, 
    allUsers,
}