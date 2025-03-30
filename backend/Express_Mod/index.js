require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const consul = require("./middleware/consul");


const modules = require("./controllers/moduleController");
const organization = require("./controllers/organizationController");


const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Called Services

app.use("/modules", modules);
app.use("/organization", organization);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
