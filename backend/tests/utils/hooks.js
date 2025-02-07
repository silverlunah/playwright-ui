const { Before, After, setWorldConstructor } = require("@cucumber/cucumber");
const { chromium } = require("playwright");

const BoilerplatePage = require("../pages/BoilerplatePage");
class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.boilerplatePage = null;
  }
}

setWorldConstructor(CustomWorld);

Before(async function () {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.boilerplatePage = new BoilerplatePage(this.page);
});

After(async function () {
  await this.browser.close();
});
