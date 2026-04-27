const express = require("express");
const router = express.Router();
const controlleShelter = require("../controllers/shelterController")
const validateShelders = require("../middlewares/validations/createShelter")
const auth = require("../middlewares/authLogin")
const onlyVoluntario = require("../middlewares/role")

router.post("/register-shelter", auth, onlyVoluntario, validateShelders, controlleShelter.createShelter)
router.patch("/reservation-shelter/:id/status", auth, onlyVoluntario, controlleShelter.replyReservation)
router.get("/reservation/voluntary", auth, onlyVoluntario, controlleShelter.getReservationsByVoluntario);
router.post("/shelters/:id/request", auth, controlleShelter.requestReservation)
router.get("/shelters", controlleShelter.allShelters)

module.exports = router;
