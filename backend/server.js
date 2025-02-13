const { Server } = require("socket.io");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const cron = require("node-cron");

const FEATURES_DIR = path.join(__dirname, "tests/features");
const REPORTS_DIR = path.join(__dirname, "reports");

app.use(cors({ origin: "*" }));

// Store cron jobs in memory
const cronJobs = {};

/**
 * Fetch test and suite IDs to .json format
 * so they can be displayed in FE
 */
const getTestSuites = () => {
  const suites = [];

  const files = fs
    .readdirSync(FEATURES_DIR)
    .filter((file) => file.endsWith(".feature"));

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(FEATURES_DIR, file), "utf8");

    let suiteName = "";
    let suiteTags = [];
    const tests = [];

    // Extract suite name
    const featureMatch = content.match(/Feature:\s*(.+)/);
    if (featureMatch) {
      suiteName = featureMatch[1].trim();
    }

    // Extract suite tags
    const suiteTagsMatch = content.match(/^(@[^\n]+)/m);
    if (suiteTagsMatch) {
      suiteTags = suiteTagsMatch[0]
        .split(/\s+/)
        .map((tag) => tag.replace("@", ""));
    }

    // Extract test cases with tags
    const scenarioMatches = [
      ...content.matchAll(/(@[^\n]+)\s*Scenario:\s*(.+)/g),
    ];

    scenarioMatches.forEach((match) => {
      const tags = match[1].split(/\s+/).map((tag) => tag.replace("@", ""));
      const scenarioText = match[2].trim();

      if (tags.length > 0) {
        const testId = tags.shift(); // The first tag is the test ID
        tests.push({
          id: tags.length > 0 ? [testId, ...tags] : testId, // Keep array if multiple tags exist
          testCase: scenarioText,
        });
      }
    });

    if (suiteName && tests.length) {
      suites.push({
        suiteName,
        suiteId: suiteTags.length > 1 ? suiteTags : suiteTags[0], // If multiple, use array
        tests,
      });
    }
  });

  return { suites };
};

/**
 * -----------
 * API Endpoints
 * -----------
 */

// GET: List of available test suites
app.get("/tests", (req, res) => {
  const suites = getTestSuites();
  res.json({ suites });
});

// GET: List of reports
app.get("/reports", (req, res) => {
  fs.readdir(REPORTS_DIR, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to read reports directory" });
    }

    const reportFiles = files
      .filter((file) => file.endsWith(".html"))
      .map((file) => ({
        file,
        time: fs.statSync(path.join(REPORTS_DIR, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time)
      .map((item) => item.file);

    res.json({ reports: reportFiles });
  });
});

// GET: Get the latest report
app.get("/latest-report", (req, res) => {
  fs.readdir(REPORTS_DIR, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to read reports directory" });
    }

    const reportFiles = files
      .filter((file) => file.match(/(PASS|FAIL)_cucumber_report_.*\.html/))
      .map((file) => ({
        file,
        time: fs.statSync(path.join(REPORTS_DIR, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (reportFiles.length === 0) {
      return res.json({ latestReport: null });
    }

    res.json({ latestReport: reportFiles[0].file });
  });
});

/**
 * ------------------------------
 * Cron Job Management Endpoints
 * ------------------------------
 */

// GET: List all active cron jobs
app.get("/cron-jobs", (req, res) => {
  // Extract details of active cron jobs, excluding circular references
  const cronJobDetails = Object.keys(cronJobs).map((taskName) => {
    const cronJob = cronJobs[taskName];
    console.log(cronJob);
    return {
      taskName,
      cronExpression: cronJob.cronExpression,
      tags: cronJob.tags,
      lastRun: cronJob.lastRun, // Keep last run information if necessary
      // Avoid sending the entire cronJob object, just necessary details
    };
  });

  res.json({ cronJobs: cronJobDetails });
});

// POST: Add a new cron job
app.post("/cron-jobs", express.json(), (req, res) => {
  const { cronExpression, taskName, tags } = req.body;

  if (!cronExpression || !taskName || !tags) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const cronJob = cron.schedule(cronExpression, () => {
    console.log(`Running task: ${taskName}`);

    // Ensure the tag expression is correctly formatted
    const formattedTags = `(${tags
      .replace(/ OR /g, " or ")
      .replace(/ AND /g, " and ")})`;

    // Run the command `TAG="tags" npm run test`
    const task = spawn("npm", ["run", "test"], {
      env: { ...process.env, TAG: formattedTags }, // Set formatted TAG environment variable
    });

    task.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    task.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    task.on("close", (code) => {
      console.log(`Task ${taskName} finished with code ${code}`);
    });
  });

  cronJobs[taskName] = {
    cronExpression,
    lastRun: null,
    cronJob,
  };

  // Only return relevant details in response
  res.json({
    message: `Cron job ${taskName} added`,
    cronJob: { taskName, cronExpression }, // Only send taskName and cronExpression
  });
});

// DELETE: Remove a cron job by task name
app.delete("/cron-jobs/:taskName", (req, res) => {
  const { taskName } = req.params;

  if (!cronJobs[taskName]) {
    return res.status(404).json({ error: `Cron job ${taskName} not found` });
  }

  cronJobs[taskName].cronJob.stop();
  delete cronJobs[taskName];
  res.json({ message: `Cron job ${taskName} deleted` });
});

/**
 * -----------
 * WebSockets
 * -----------
 */
io.on("connection", (socket) => {
  console.log("WebSocket connection established");

  socket.on("run-test", (testID) => {
    console.log(`Running Playwright test with ID: ${testID}`);

    const tag = testID ? `@${testID}` : "";
    const testProcess = spawn("npm", ["run", "test"], {
      env: { ...process.env, TAG: tag },
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
