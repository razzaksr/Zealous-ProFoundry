require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");

const MCQ = require("./controllers/mcqController");
const Test = require("./controllers/testController");
const TestCase = require("./controllers/testcaseController");
const Coding = require("./controllers/codeController");
const consul = require("./middleware/consul_service");

const app = express();
const port = process.env.PORT;

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

//  Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/mcq", MCQ);
app.use("/test", Test);
app.use("/testcase", TestCase);
app.use("/coding", Coding);

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
