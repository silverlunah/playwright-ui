const reporter = require("cucumber-html-reporter");

const options = {
  theme: "bootstrap",
  jsonFile: "reports/cucumber_report.json",
  output: "reports/cucumber_report.html",
  reportSuiteAsScenarios: true,
  launchReport: true, // Automatically opens the report in a browser
  metadata: {
    "App Name": "Your App",
    "Test Environment": "Local",
    Browser: "Chromium",
    Platform: "Ubuntu",
    Parallel: "Scenarios",
    Executed: "Local",
  },
};

reporter.generate(options);
