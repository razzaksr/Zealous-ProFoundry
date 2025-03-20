require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");

const poc = require("./controllers/pocController");
const expert = require("./controllers/expertController");
const modules = require("./controllers/moduleController");
const organization = require("./controllers/organizationController");
const user = require("./controllers/userController");


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Called Services
app.use("/user_service", user);
app.use("/poc_service", poc);
app.use("/expert_service", expert);
app.use("/module_service", modules);
app.use("/organization_service", organization);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
