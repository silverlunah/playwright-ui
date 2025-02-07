const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { spawn } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("run-test", (testID) => {
    console.log(`Running Playwright test with ID: ${testID}`);

    const tag = `@${testID}`; // Build dynamic tag
    const testProcess = spawn("npm", ["run", "test"], {
      env: { ...process.env, TAG: tag }, // Pass the tag as an environment variable
    });

    testProcess.stdout.on("data", (data) => {
      socket.emit("log", data.toString());
    });

    testProcess.stderr.on("data", (data) => {
      socket.emit("log", `[ERROR] ${data.toString()}`);
    });

    testProcess.on("close", (code) => {
      socket.emit("log", `Test finished with code ${code}`);
      socket.emit("done");
    });
  });
});

app.use("/reports", express.static("reports"));
server.listen(3001, () => console.log("Backend running on port 3001"));
