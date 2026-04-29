const express = require("express");
const router = express.Router();
const controlleOrder = require("../controllers/orderController");
const validateOrder = require("../middlewares/validations/createOrder");
const auth = require("../middlewares/authLogin");
const onlyVoluntario = require("../middlewares/role");

router.post("/create-orders", auth, validateOrder, controlleOrder.createOrder);
router.get("/orders", controlleOrder.getOrders);
router.get("/orders/all", controlleOrder.getAllOrder);
router.post("/orders/:id/accept", auth, onlyVoluntario, controlleOrder.acceptOrder);
router.post("/orders/:id/messages", auth, controlleOrder.updateOrder);
router.get("/orders/:id/messages", auth, controlleOrder.getUpdateOrder);
router.patch("/orders/:id/finish", auth, onlyVoluntario,controlleOrder.endOrder);

module.exports = router;