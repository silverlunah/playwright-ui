const reporter = require("cucumber-html-reporter");
const fs = require("fs");
const path = require("path");

const reportsDir = "reports";
const maxReports = 20;
const jsonReportFile = path.join(reportsDir, "cucumber_report.json");

// Ensure the reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Get all existing reports
const existingReports = fs
  .readdirSync(reportsDir)
  .filter((file) => file.startsWith("PASS_") || file.startsWith("FAIL_"))
  .sort(
    (a, b) =>
      fs.statSync(path.join(reportsDir, b)).mtime -
      fs.statSync(path.join(reportsDir, a)).mtime
  );

// Delete the oldest reports if there are more than `maxReports`
while (existingReports.length >= maxReports) {
  const oldestReport = existingReports.pop();
  fs.unlinkSync(path.join(reportsDir, oldestReport)); // Delete the file
}

// Read the JSON report and determine pass/fail status
let status = "PASS"; // Default to pass
if (fs.existsSync(jsonReportFile)) {
  const reportData = JSON.parse(fs.readFileSync(jsonReportFile, "utf8"));

  // Check if any scenario has failed
  const hasFailures = reportData.some((feature) =>
    feature.elements.some((scenario) =>
      scenario.steps.some((step) => step.result.status === "failed")
    )
  );

  if (hasFailures) {
    status = "FAIL";
  }
}

// Generate the new report with PASS/FAIL in the filename
const timestamp = new Date().toISOString().replace(/[-:.]/g, "_");
const reportFileName = `${status}_cucumber_report_${timestamp}.html`;

const options = {
  theme: "bootstrap",
  jsonFile: jsonReportFile,
  output: path.join(reportsDir, reportFileName),
  reportSuiteAsScenarios: true,
  launchReport: true, // Automatically opens the report in a browser
  metadata: {
    "App Name": "Playwright UI",
    "Test Environment": "Local",
    Browser: "Chromium",
    Platform: "Ubuntu",
    Parallel: "Scenarios",
    Executed: "Local",
  },
};

reporter.generate(options);
console.log(`Generated report: ${reportFileName}`);
