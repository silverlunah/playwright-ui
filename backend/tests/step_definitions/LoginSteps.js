const { Given, When, Then } = require("@cucumber/cucumber");

Given("I am in Buzzify Login page", async function () {
  await this.loginPage.goToLoginPage();
});

Given("I fail this test", async function () {
  throw new Error("err");
});
