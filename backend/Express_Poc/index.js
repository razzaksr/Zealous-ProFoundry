require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");

const poc = require("./controllers/pocController");
const expert = require("./controllers/expertController");
const consul = require("./interservices/consul");
const { exec } = require("child_process");




const app = express();
const PORT = process.env.PORT ;

//  Start Consul Agent (if not running)
exec("consul members", (err, stdout, stderr) => {
  if (err || stderr) {
      console.log("Consul is not running. Starting Consul...");
      const consulProcess = exec("consul agent -dev", (error, stdout, stderr) => {
          if (error) {
              console.error(`Error starting Consul: ${error.message}`);
              return;
          }
          console.log("Consul started successfully");
      });

      // Print Consul logs in real-time
      consulProcess.stdout.pipe(process.stdout);
      consulProcess.stderr.pipe(process.stderr);
  } else {
      console.log("Consul is already running.");
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Called Services

app.use("/poc", poc);
app.use("/expert", expert);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
