// Load environment variables first
require("dotenv").config();

const { Before, After, setWorldConstructor } = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const Utils = require("../utils/utils");
const LoginPage = require("../pages/LoginPage");

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.loginPage = null;
    this.utils = null;
  }
}

setWorldConstructor(CustomWorld);

Before(async function () {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.loginPage = new LoginPage(this.page);
  this.utils = new Utils(this.page);
});

After(async function () {
  // Close the browser after each test
  await this.browser.close();
});
