const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes")
const shelterRoutes = require("./routes/shelterRoutes")
const orderRoutes = require("./routes/orderRoutes")
const cors = require("cors")

app.use(express.json());
app.use(cors())

app.get("/", (req, res) => {
  res.send("<h1>SOS!!</h1>");
});

app.use(userRoutes);
app.use(shelterRoutes); 
app.use(orderRoutes)

module.exports = app;